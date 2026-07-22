class ConstructionActivity extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.activityId = "";
    this.canvas = null;
    this.feedbackElement = null;
  }

  render() {
    const {
      lessonState,
      getStepKey
    } = this.appContext;

    this.activityId =
      getStepKey(this.step);

    const activityState =
      lessonState.getActivityState(
        this.activityId
      );

    const savedObjects =
      activityState.data.objects || [];

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

    this.savedObjects =
      savedObjects;

    const instruction =
      this.step.instruction ||
      this.step.prompt ||
      "לחץ בתוך המשטח כדי ליצור נקודה.";

    const hasPoint =
      savedObjects.some(
        (object) =>
          object.type === "point"
      );

    return `
      <div
        class="construction-activity"
        data-activity-type="construction"
      >
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

        ${
          this.step.reflection
            ? `
              <div class="reflection-box">
                <strong>
                  שאלה למחשבה:
                </strong>

                <p>
                  ${this.step.reflection}
                </p>
              </div>
            `
            : ""
        }
      </div>
    `;
  }

  attach() {
    if (!this.canvas) {
      return;
    }

    this.canvas.attach();

    this.feedbackElement =
      document.getElementById(
        `construction-feedback-${this.activityId}`
      );

    this.canvas.loadObjects(
      this.savedObjects || []
    );

    this.canvas.enablePointCreation();
  }

  handlePointCreated(position) {
    const {
      lessonState
    } = this.appContext;

    const point = {
      id:
        `${this.activityId}-point`,
      type: "point",
      x: position.x,
      y: position.y,
      label:
        this.step.pointLabel || ""
    };

    /*
      בשלב הזה הפעילות מאפשרת
      יצירת נקודה אחת בלבד.
    */
    this.canvas.loadObjects([
      point
    ]);

    lessonState.updateActivityData(
      this.activityId,
      {
        objects: [point]
      }
    );

    if (this.feedbackElement) {
      this.feedbackElement.textContent =
        "יצרת נקודה. עכשיו אפשר להמשיך.";
    }
  }

  validate() {
    const activityState =
      this.appContext.lessonState
        .getActivityState(
          this.activityId
        );

    const objects =
      activityState.data.objects || [];

    const hasPoint =
      objects.some(
        (object) =>
          object.type === "point"
      );

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
    this.savedObjects = [];
  }
}

window.ConstructionActivity =
  ConstructionActivity;
