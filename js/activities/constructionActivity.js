class ConstructionActivity extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.activityId = "";
    this.canvas = null;
    this.feedbackElement = null;
    this.workspace = null;
  }

  render() {
    const {
      lessonState,
      getStepKey
    } = this.appContext;

    this.activityId =
      getStepKey(this.step);

    this.workspace =
      lessonState.getGeometryWorkspace();

    this.canvas =
      new GeometryCanvas({
        id:
          `geometry-canvas-${this.activityId}`,

        width:
          this.step.canvasWidth || 640,

        height:
          this.step.canvasHeight || 360,

        className:
          "point-construction-canvas",

        onPointCreated: (position) => {
          this.handlePointCreated(
            position
          );
        }
      });

    const instruction =
      this.step.instruction ||
      "לחץ בתוך המשטח כדי ליצור נקודה.";

    const hasPoint =
      this.workspace
        .getObjectsByType("point")
        .length > 0;

    return `
      <div class="construction-activity">

        <p class="interaction-instruction">
          ${instruction}
        </p>

        ${this.canvas.render()}

        <p
          id="construction-feedback-${this.activityId}"
          class="interaction-feedback"
          aria-live="polite"
        >
          ${
            hasPoint
              ? "יצרת נקודה. עכשיו אפשר להמשיך."
              : "עדיין לא נוצרה נקודה."
          }
        </p>

      </div>
    `;
  }

  attach() {
    this.canvas.attach();

    this.feedbackElement =
      document.getElementById(
        `construction-feedback-${this.activityId}`
      );

    this.canvas.loadObjects(
      this.workspace.getAllObjects()
    );

    this.canvas.enablePointCreation();
  }

  handlePointCreated(position) {

    const point = {
      id: "point-A",
      type: "point",
      x: position.x,
      y: position.y,
      label:
        this.step.pointLabel || "A"
    };

    /*
      GeometryWorkspace מחליף את
      activity.data.objects
    */

    this.workspace.clear();

    this.workspace.addPoint(point);

    this.canvas.loadObjects(
      this.workspace.getAllObjects()
    );

    this.appContext.lessonState
      .markCompleted(
        this.activityId
      );

    if (this.feedbackElement) {
      this.feedbackElement.textContent =
        "יצרת נקודה. עכשיו אפשר להמשיך.";
    }
  }

  validate() {

    const hasPoint =
      this.workspace
        .getObjectsByType("point")
        .length > 0;

    if (hasPoint) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    return hasPoint;
  }

  focus() {
    if (
      this.canvas &&
      this.canvas.element
    ) {
      this.canvas.element.focus();
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.destroy();
    }

    this.canvas = null;
    this.feedbackElement = null;
    this.workspace = null;
  }
}

window.ConstructionActivity =
  ConstructionActivity;
