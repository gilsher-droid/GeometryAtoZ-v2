class MeasureAngleActivity
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

    this.workspace = null;
    this.geometryEngine = null;
    this.canvas = null;

    this.inputElement = null;
    this.feedbackElement = null;
    this.measurementElement = null;
    this.measureButton = null;

    this.actualDegrees = null;
    this.measurementActivated = false;
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

    const activityState =
      lessonState.getActivityState(
        this.activityId
      );

    const savedValue =
      activityState.data
        .measuredDegrees ?? "";

    this.measurementActivated =
      Boolean(
        activityState.data
          .measurementActivated
      );

    const angle =
      this.getAngle();

    if (angle) {
      this.actualDegrees =
        Math.round(
          angle.degrees * 10
        ) / 10;
    }

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
          "measure-angle-canvas"
      });

    const instruction =
      this.step.instruction ||
      "הפעל את מד הזווית, התבונן במדידה וכתוב את גודל הזווית.";

    return `
      <div
        class="construction-activity"
        data-activity-type="measure-angle"
      >
        <p class="interaction-instruction">
          ${instruction}
        </p>

        ${
          !angle
            ? `
              <p class="interaction-feedback">
                לא נמצאה זווית למדידה. חזור לשלב יצירת הזווית.
              </p>
            `
            : ""
        }

        ${this.canvas.render()}

        <div class="response-box">

          <button
            id="measure-angle-button-${this.activityId}"
            type="button"
            ${angle ? "" : "disabled"}
          >
            ${
              this.measurementActivated
                ? "מד הזווית הופעל"
                : "הפעל מד זווית"
            }
          </button>

          <p
            id="angle-measurement-${this.activityId}"
            class="interaction-feedback"
            aria-live="polite"
          >
            ${
              this.measurementActivated &&
              this.actualDegrees !== null
                ? `מד הזווית מציג: ${this.actualDegrees}°`
                : "המדידה עדיין מוסתרת."
            }
          </p>

          <label
            for="angle-answer-${this.activityId}"
          >
            <strong>
              מהו גודל הזווית במעלות?
            </strong>
          </label>

          <input
            id="angle-answer-${this.activityId}"
            type="number"
            min="0"
            max="180"
            step="0.1"
            inputmode="decimal"
            value="${savedValue}"
            placeholder="לדוגמה: 65"
          />

          <p
            id="measure-feedback-${this.activityId}"
            class="response-status"
            aria-live="polite"
          >
          </p>

        </div>
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

    this.canvas.loadObjects(
      this.workspace
        .getAllObjects()
    );

    this.drawAngleMarker();

    this.inputElement =
      document.getElementById(
        `angle-answer-${this.activityId}`
      );

    this.feedbackElement =
      document.getElementById(
        `measure-feedback-${this.activityId}`
      );

    this.measurementElement =
      document.getElementById(
        `angle-measurement-${this.activityId}`
      );

    this.measureButton =
      document.getElementById(
        `measure-angle-button-${this.activityId}`
      );

    if (this.measureButton) {
      this.measureButton
        .addEventListener(
          "click",
          () => {
            this.activateMeasurement();
          }
        );
    }

    if (this.inputElement) {
      this.inputElement
        .addEventListener(
          "input",
          () => {
            this.save();
          }
        );
    }
  }

  getAngle() {
    if (
      !this.geometryEngine
    ) {
      return null;
    }

    return this.geometryEngine
      .getAngle({
        id:
          this.step.angleId ||
          "angle-1",

        firstRayId:
          this.step.firstRayId ||
          "ray-1",

        secondRayId:
          this.step.secondRayId ||
          "ray-2",

        label:
          this.step.angleLabel ||
          ""
      });
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

      /*
        בשלב המדידה המספר אינו מוצג
        על הקשת עצמה. הוא יופיע רק
        לאחר הפעלת מד הזווית.
      */
      showDegrees: false
    });
  }

  activateMeasurement() {
    if (
      this.actualDegrees === null
    ) {
      return;
    }

    this.measurementActivated =
      true;

    if (
      this.measurementElement
    ) {
      this.measurementElement
        .textContent =
          `מד הזווית מציג: ${this.actualDegrees}°`;
    }

    if (
      this.measureButton
    ) {
      this.measureButton
        .textContent =
          "מד הזווית הופעל";

      this.measureButton.disabled =
        true;
    }

    this.save();
  }

  save() {
    const measuredDegrees =
      this.inputElement
        ? this.inputElement.value
        : "";

    this.appContext.lessonState
      .updateActivityData(
        this.activityId,
        {
          measuredDegrees,
          measurementActivated:
            this.measurementActivated,
          actualDegrees:
            this.actualDegrees
        }
      );
  }

  validate() {
    this.save();

    if (
      this.actualDegrees === null ||
      !this.measurementActivated ||
      !this.inputElement
    ) {
      return false;
    }

    const studentValue =
      Number(
        this.inputElement.value
      );

    if (
      !Number.isFinite(
        studentValue
      )
    ) {
      if (
        this.feedbackElement
      ) {
        this.feedbackElement
          .textContent =
            "כתוב את גודל הזווית במעלות.";
      }

      return false;
    }

    const tolerance =
      this.step.tolerance ??
      1;

    const difference =
      Math.abs(
        studentValue -
        this.actualDegrees
      );

    const isValid =
      difference <= tolerance;

    if (!isValid) {
      if (
        this.feedbackElement
      ) {
        this.feedbackElement
          .textContent =
            "המדידה אינה מתאימה. בדוק שוב את מד הזווית.";
      }

      return false;
    }

    if (
      this.feedbackElement
    ) {
      this.feedbackElement
        .textContent =
          "המדידה נכונה.";
    }

    this.appContext.lessonState
      .markCompleted(
        this.activityId
      );

    return true;
  }

  focus() {
    if (
      this.inputElement
    ) {
      this.inputElement.focus();
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.destroy();
    }

    this.canvas = null;
    this.workspace = null;
    this.geometryEngine = null;

    this.inputElement = null;
    this.feedbackElement = null;
    this.measurementElement = null;
    this.measureButton = null;
  }
}

window.MeasureAngleActivity =
  MeasureAngleActivity;
