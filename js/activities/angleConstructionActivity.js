class AngleConstructionActivity
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
    this.geometryEngine = null;
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

    this.geometryEngine =
      new GeometryEngine({
        workspace:
          this.workspace
      });

    const originPointId =
      this.step.originPointId ||
      "point-A";

    const firstRayId =
      this.step.firstRayId ||
      "ray-1";

    const secondRayId =
      this.step.secondRayId ||
      "ray-2";

    const originPoint =
      this.workspace.getObject(
        originPointId
      );

    const firstRay =
      this.workspace.getObject(
        firstRayId
      );

    const angle =
      this.geometryEngine.getAngle({
        id:
          this.step.angleId ||
          "angle-1",

        firstRayId,
        secondRayId,

        label:
          this.step.angleLabel ||
          ""
      });

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
          "angle-construction-canvas",

        onRayCreated:
          (rayData) => {
            this.handleSecondRayCreated(
              rayData
            );
          }
      });

    const instruction =
      this.step.instruction ||
      "גרור מהנקודה A בכיוון חדש כדי ליצור קרן שנייה.";

    return `
      <div
        class="construction-activity"
        data-activity-type="angle-construction"
      >
        <p class="interaction-instruction">
          ${instruction}
        </p>

        ${
          !originPoint
            ? `
              <p class="interaction-feedback">
                לא נמצאה נקודת המוצא. חזור לשלב הנקודה.
              </p>
            `
            : ""
        }

        ${
          !firstRay
            ? `
              <p class="interaction-feedback">
                לא נמצאה הקרן הראשונה. חזור לשלב הקרן.
              </p>
            `
            : ""
        }

        ${this.canvas.render()}

        <p
          id="angle-feedback-${this.activityId}"
          class="interaction-feedback"
          aria-live="polite"
        >
          ${this.getFeedbackText(angle)}
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
        `angle-feedback-${this.activityId}`
      );

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    const originPointId =
      this.step.originPointId ||
      "point-A";

    const firstRayId =
      this.step.firstRayId ||
      "ray-1";

    if (
      this.workspace.hasObject(
        originPointId
      ) &&
      this.workspace.hasObject(
        firstRayId
      )
    ) {
      this.canvas.enableRayCreation({
        originPointId
      });
    }
  }

  handleSecondRayCreated({
    originPointId,
    endX,
    endY
  }) {
    const firstRayId =
      this.step.firstRayId ||
      "ray-1";

    const secondRayId =
      this.step.secondRayId ||
      "ray-2";

    /*
      מונעים יצירת קרן שנייה
      החופפת כמעט לחלוטין לקרן הראשונה.
    */
    const firstRay =
      this.workspace.getObject(
        firstRayId
      );

    const originPoint =
      this.workspace.getObject(
        originPointId
      );

    if (
      firstRay &&
      originPoint
    ) {
      const firstAngle =
        Math.atan2(
          firstRay.endY -
            originPoint.y,
          firstRay.endX -
            originPoint.x
        );

      const secondAngle =
        Math.atan2(
          endY -
            originPoint.y,
          endX -
            originPoint.x
        );

      const difference =
        Math.abs(
          this.normalizeAngleDifference(
            firstAngle -
              secondAngle
          )
        );

      const minimumDifference =
        5 * Math.PI / 180;

      if (
        difference <
        minimumDifference
      ) {
        if (
          this.feedbackElement
        ) {
          this.feedbackElement.textContent =
            "הקרן השנייה קרובה מדי לקרן הראשונה. נסה כיוון שונה.";
        }

        return;
      }
    }

    this.workspace.addRay({
      id: secondRayId,
      originPointId,
      endX,
      endY,
      label:
        this.step.secondRayLabel ||
        ""
    });

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    this.canvas.enableRayCreation({
      originPointId
    });

    const angle =
      this.geometryEngine.getAngle({
        id:
          this.step.angleId ||
          "angle-1",

        firstRayId,
        secondRayId,

        label:
          this.step.angleLabel ||
          ""
      });

    if (angle) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    if (
      this.feedbackElement
    ) {
      this.feedbackElement.textContent =
        this.getFeedbackText(
          angle
        );
    }
  }

  normalizeAngleDifference(
    radians
  ) {
    let normalized =
      radians;

    while (
      normalized >
      Math.PI
    ) {
      normalized -=
        2 * Math.PI;
    }

    while (
      normalized <
      -Math.PI
    ) {
      normalized +=
        2 * Math.PI;
    }

    return normalized;
  }

  getFeedbackText(angle) {
    if (!angle) {
      return (
        "עדיין לא נוצרה זווית. צור קרן שנייה מאותה נקודה."
      );
    }

    const roundedDegrees =
      Math.round(
        angle.degrees * 10
      ) / 10;

    return (
      `נוצרה זווית בגודל משוער של ${roundedDegrees}°.`
    );
  }

  validate() {
    if (
      !this.workspace ||
      !this.geometryEngine
    ) {
      return false;
    }

    const angle =
      this.geometryEngine.getAngle({
        id:
          this.step.angleId ||
          "angle-1",

        firstRayId:
          this.step.firstRayId ||
          "ray-1",

        secondRayId:
          this.step.secondRayId ||
          "ray-2"
      });

    if (angle) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    return Boolean(
      angle
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
    this.geometryEngine = null;
    this.feedbackElement = null;
  }
}

window.AngleConstructionActivity =
  AngleConstructionActivity;
