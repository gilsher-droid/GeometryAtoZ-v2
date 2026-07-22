class RayConstructionActivity
  extends BaseActivity {
  constructor(
    step,
    appContext = {}
  ) {
    super(
      step,
      appContext
    );

    this.activityId = "";
    this.canvas = null;
    this.workspace = null;
    this.feedbackElement = null;
  }

  render() {
    const {
      lessonState,
      getStepKey
    } = this.appContext;

    this.activityId =
      getStepKey(
        this.step
      );

    this.workspace =
      lessonState
        .getGeometryWorkspace();

    const originPointId =
      this.step.originPointId ||
      "point-A";

    const originPoint =
      this.workspace.getObject(
        originPointId
      );

    this.canvas =
      new GeometryCanvas({
        id:
          `geometry-canvas-${this.activityId}`,

        width:
          this.step.canvasWidth ||
          640,

        height:
          this.step.canvasHeight ||
          360,

        className:
          "ray-construction-canvas",

        onRayCreated:
          (rayData) => {
            this.handleRayCreated(
              rayData
            );
          }
      });

    const rayId =
      this.step.rayId ||
      "ray-1";

    const hasRay =
      this.workspace.hasObject(
        rayId
      );

    const instruction =
      this.step.instruction ||
      "גרור מהנקודה A לכיוון כלשהו כדי ליצור קרן.";

    return `
      <div
        class="construction-activity"
        data-activity-type="ray-construction"
      >
        <p class="interaction-instruction">
          ${instruction}
        </p>

        ${
          originPoint
            ? ""
            : `
              <p class="interaction-feedback">
                לא נמצאה נקודת המוצא. חזור לשלב הקודם וצור נקודה.
              </p>
            `
        }

        ${this.canvas.render()}

        <p
          id="ray-feedback-${this.activityId}"
          class="interaction-feedback"
          aria-live="polite"
        >
          ${
            hasRay
              ? "יצרת קרן. עכשיו אפשר להמשיך."
              : "עדיין לא נוצרה קרן."
          }
        </p>
      </div>
    `;
  }

  attach() {
    if (
      !this.canvas ||
      !this.workspace
    ) {
      return;
    }

    this.canvas.attach();

    this.feedbackElement =
      document.getElementById(
        `ray-feedback-${this.activityId}`
      );

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    const originPointId =
      this.step.originPointId ||
      "point-A";

    if (
      this.workspace.hasObject(
        originPointId
      )
    ) {
      this.canvas.enableRayCreation({
        originPointId
      });
    }
  }

  handleRayCreated({
    originPointId,
    endX,
    endY
  }) {
    const rayId =
      this.step.rayId ||
      "ray-1";

    this.workspace.addRay({
      id: rayId,
      originPointId,
      endX,
      endY,
      label:
        this.step.rayLabel ||
        ""
    });

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    this.canvas.enableRayCreation({
      originPointId
    });

    this.appContext.lessonState
      .markCompleted(
        this.activityId
      );

    if (
      this.feedbackElement
    ) {
      this.feedbackElement.textContent =
        "יצרת קרן. עכשיו אפשר להמשיך.";
    }
  }

  validate() {
    const originPointId =
      this.step.originPointId ||
      "point-A";

    const rayId =
      this.step.rayId ||
      "ray-1";

    const hasOriginPoint =
      this.workspace.hasObject(
        originPointId
      );

    const hasRay =
      this.workspace.hasObject(
        rayId
      );

    if (
      hasOriginPoint &&
      hasRay
    ) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    return (
      hasOriginPoint &&
      hasRay
    );
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
    this.workspace = null;
    this.feedbackElement = null;
  }
}

window.RayConstructionActivity =
  RayConstructionActivity;
