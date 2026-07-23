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

    this.quantizeExistingSecondRay();

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

    /*
      אם כבר קיימות שתי קרניים,
      מציגים מיד את סימון הזווית.
    */
    this.drawAngleMarker();

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
      this.enableSecondRayCreation();
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
    const quantizedRayEnd =
      this.quantizeSecondRayEnd({
        originPointId,
        endX,
        endY
      });

    if (!quantizedRayEnd) {
      if (this.feedbackElement) {
        this.feedbackElement.textContent =
          `בחר זווית בין ${this.getMinimumConstructedAngle()}° ל־${this.getMaximumConstructedAngle()}°.`;
      }

      return;
    }

    this.workspace.addRay({
      id: secondRayId,
      originPointId,
      endX:
        quantizedRayEnd.endX,
      endY:
        quantizedRayEnd.endY,
      label:
        this.step.secondRayLabel ||
        ""
    });

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    /*
      לאחר יצירת הקרן השנייה,
      מציגים מחדש את הקשת ואת המידה.
    */
    this.drawAngleMarker();

    this.enableSecondRayCreation();

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

  enableSecondRayCreation() {
    const originPointId =
      this.step.originPointId ||
      "point-A";

    this.canvas.enableRayCreation({
      originPointId,
      transformRayEnd:
        (rayData) =>
          this.quantizeSecondRayEnd(
            rayData
          )
    });
  }

  quantizeSecondRayEnd({
    originPointId,
    endX,
    endY
  } = {}) {
    if (!this.geometryEngine) {
      return null;
    }

    return this.geometryEngine
      .getQuantizedRayEnd({
        originPointId:
          originPointId ||
          this.step.originPointId ||
          "point-A",
        baselineRayId:
          this.step.firstRayId ||
          "ray-1",
        endX,
        endY,
        stepDegrees:
          this.step
            .angleStepDegrees ?? 1,
        minimumAngle:
          this.getMinimumConstructedAngle(),
        maximumAngle:
          this.getMaximumConstructedAngle()
      });
  }

  quantizeExistingSecondRay() {
    const secondRayId =
      this.step.secondRayId ||
      "ray-2";
    const secondRay =
      this.workspace.getObject(
        secondRayId
      );

    if (!secondRay) {
      return;
    }

    const quantized =
      this.quantizeSecondRayEnd({
        originPointId:
          secondRay.originPointId,
        endX: secondRay.endX,
        endY: secondRay.endY
      });

    if (!quantized) {
      return;
    }

    this.workspace.addRay({
      ...secondRay,
      endX: quantized.endX,
      endY: quantized.endY
    });
  }

  getMinimumConstructedAngle() {
    const configured =
      Number(
        this.step
          .minimumConstructedAngle
      );

    return Number.isFinite(
      configured
    )
      ? configured
      : 10;
  }

  getMaximumConstructedAngle() {
    const configured =
      Number(
        this.step
          .maximumConstructedAngle
      );

    return Number.isFinite(
      configured
    )
      ? configured
      : 170;
  }

  drawAngleMarker() {
    if (
      !this.canvas ||
      !this.workspace
    ) {
      return;
    }

    const firstRayId =
      this.step.firstRayId ||
      "ray-1";

    const secondRayId =
      this.step.secondRayId ||
      "ray-2";

    if (
      !this.workspace.hasObject(
        firstRayId
      ) ||
      !this.workspace.hasObject(
        secondRayId
      )
    ) {
      return;
    }

    this.canvas.drawAngleMarker({
      firstRayId,
      secondRayId,

      radius:
        this.step.angleMarkerRadius ||
        48,

      showDegrees:
        this.step.showAngleDegrees !==
        false
    });
  }

  getFeedbackText(angle) {
    if (!angle) {
      return (
        "עדיין לא נוצרה זווית. צור קרן שנייה מאותה נקודה."
      );
    }

    const roundedDegrees =
      Math.round(
        angle.degrees
      );

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
