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
    this.protractor = null;

    this.inputElement = null;
    this.feedbackElement = null;
    this.submitButton = null;

    this.actualDegrees = null;
    this.hasSavedProtractor = false;
    this.boundInputHandler = null;
    this.boundSubmitHandler = null;
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
    const angle = this.getAngle();

    if (angle) {
      this.actualDegrees =
        angle.degrees;
    }

    const vertexPointId =
      this.getVertexPointId();
    const vertex =
      vertexPointId
        ? this.workspace.getObject(
            vertexPointId
          )
        : null;
    const width =
      this.step.canvasWidth || 640;
    const height =
      this.step.canvasHeight || 360;
    const savedProtractor =
      activityState.data
        .protractor || {};

    this.hasSavedProtractor =
      Boolean(
        activityState.data
          .protractor
      );

    this.protractor =
      new Protractor({
        id:
          savedProtractor.id ||
          `${this.activityId}-protractor`,
        x:
          savedProtractor.x ??
          this.clamp(
            (vertex
              ? vertex.x
              : width / 2) + 90,
            20,
            width - 20
          ),
        y:
          savedProtractor.y ??
          this.clamp(
            (vertex
              ? vertex.y
              : height / 2) + 70,
            20,
            height - 20
          ),
        rotation:
          savedProtractor.rotation ?? 0,
        radius:
          savedProtractor.radius ??
          this.step.protractorRadius ??
          130,
        visible:
          savedProtractor.visible ?? true,
        targetVertexId:
          vertexPointId,
        baselineRayId:
          this.step.firstRayId ||
          "ray-1",
        centerLocked:
          savedProtractor
            .centerLocked ?? false,
        baselineLocked:
          savedProtractor
            .baselineLocked ?? false
      });

    this.restoreProtractorLocks();

    this.canvas =
      new GeometryCanvas({
        id:
          `geometry-canvas-${this.activityId}`,
        width,
        height,
        className:
          "measure-angle-canvas"
      });

    const instruction =
      this.step.instruction ||
      "מקם את מרכז מד הזווית על הקודקוד, יישר את קו ה־0° עם הקרן הראשונה וקרא את המידה.";

    return `
      <div
        class="construction-activity measure-angle-activity"
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

        <div class="measure-angle-response">
          <label
            for="angle-answer-${this.activityId}"
          >
            <strong>
              מהו גודל הזווית במעלות?
            </strong>
          </label>

          <div class="measure-angle-controls">
            <input
              id="angle-answer-${this.activityId}"
              type="number"
              min="0"
              max="180"
              step="0.1"
              inputmode="decimal"
              value="${this.escapeAttribute(savedValue)}"
              placeholder="לדוגמה: 65"
              ${angle ? "" : "disabled"}
            />

            <button
              id="measure-submit-${this.activityId}"
              type="button"
              ${angle ? "" : "disabled"}
            >
              בדוק תשובה
            </button>
          </div>

          <p
            id="measure-feedback-${this.activityId}"
            class="measure-angle-feedback"
            aria-live="polite"
          >
            ${
              angle
                ? this.getAlignmentFeedback()
                : ""
            }
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

    if (
      this.actualDegrees !== null
    ) {
      this.positionInitialProtractor();

      this.canvas.drawProtractor(
        this.protractor,
        {
          onChange:
            (
              protractorData,
              interactionEvent
            ) => {
              this.protractor.update(
                protractorData
              );
              this.appContext
                .lessonState
                .markIncomplete(
                  this.activityId
                );
              this.save();
              this.showFeedback(
                this.getProtractorChangeFeedback(
                  interactionEvent
                )
              );
            },
          snapping:
            this.getProtractorSnappingOptions()
        }
      );
    }

    this.inputElement =
      document.getElementById(
        `angle-answer-${this.activityId}`
      );
    this.feedbackElement =
      document.getElementById(
        `measure-feedback-${this.activityId}`
      );
    this.submitButton =
      document.getElementById(
        `measure-submit-${this.activityId}`
      );

    this.boundInputHandler =
      () => {
        this.appContext.lessonState
          .markIncomplete(
            this.activityId
          );
        this.save();
        this.showFeedback(
          this.getAlignmentFeedback()
        );
      };
    this.boundSubmitHandler =
      () => {
        const isValid =
          this.validate();

        if (!isValid) {
          this.focus();
        }
      };

    if (this.inputElement) {
      this.inputElement.addEventListener(
        "input",
        this.boundInputHandler
      );
    }

    if (this.submitButton) {
      this.submitButton.addEventListener(
        "click",
        this.boundSubmitHandler
      );
    }
  }

  getAngle() {
    if (!this.geometryEngine) {
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

  positionInitialProtractor() {
    if (
      this.hasSavedProtractor ||
      !this.protractor ||
      !this.canvas ||
      !this.canvas.element
    ) {
      return;
    }

    const width =
      this.canvas.element.clientWidth;
    const height =
      this.canvas.element.clientHeight;
    const radius =
      this.protractor.radius;
    const horizontalMargin =
      radius + 12;
    const minimumY =
      radius + 36;

    this.protractor.update({
      x:
        width >=
        horizontalMargin * 2
          ? this.clamp(
              this.protractor.x,
              horizontalMargin,
              width -
                horizontalMargin
            )
          : width / 2,
      y:
        height >= minimumY + 12
          ? this.clamp(
              this.protractor.y,
              minimumY,
              height - 12
            )
          : height / 2
    });
  }

  getVertexPointId() {
    if (this.step.vertexPointId) {
      return this.step.vertexPointId;
    }

    const firstRay =
      this.workspace
        ? this.workspace.getObject(
            this.step.firstRayId ||
            "ray-1"
          )
        : null;

    return firstRay
      ? firstRay.originPointId
      : "point-A";
  }

  getProtractorSnappingOptions() {
    if (!this.geometryEngine) {
      return null;
    }

    const vertex =
      this.geometryEngine.getPoint(
        this.getVertexPointId()
      );
    const baselineRayId =
      this.step.firstRayId ||
      "ray-1";

    if (!vertex) {
      return null;
    }

    return {
      centerTarget: {
        x: vertex.x,
        y: vertex.y
      },
      getCenterDistance:
        (position) =>
          this.geometryEngine
            .calculateDistance(
              position,
              vertex
            ),
      getBaselineTarget:
        (rotation) =>
          this.geometryEngine
            .getClosestBaselineRotation({
              rotation,
              rayId: baselineRayId
            }),
      centerSnapTolerance:
        this.step
          .centerSnapTolerance ?? 24,
      centerUnlockTolerance:
        this.step
          .centerUnlockTolerance ?? 32,
      baselineSnapTolerance:
        this.step
          .baselineSnapTolerance ?? 6,
      baselineUnsnapTolerance:
        this.step
          .baselineUnsnapTolerance ?? 10
    };
  }

  restoreProtractorLocks() {
    if (
      !this.protractor ||
      !this.geometryEngine
    ) {
      return;
    }

    const vertex =
      this.geometryEngine.getPoint(
        this.getVertexPointId()
      );

    if (
      !vertex ||
      !this.protractor.centerLocked
    ) {
      this.protractor.update({
        centerLocked: false,
        baselineLocked: false
      });
      return;
    }

    this.protractor.setPosition(
      vertex.x,
      vertex.y
    );

    if (
      !this.protractor.baselineLocked
    ) {
      return;
    }

    const baselineTarget =
      this.geometryEngine
        .getClosestBaselineRotation({
          rotation:
            this.protractor.rotation,
          rayId:
            this.step.firstRayId ||
            "ray-1"
        });

    if (!baselineTarget) {
      this.protractor.update({
        baselineLocked: false
      });
      return;
    }

    this.protractor.update({
      rotation:
        baselineTarget.rotation,
      baselineLocked: true
    });
  }

  getAlignmentStatus() {
    if (
      !this.geometryEngine ||
      !this.protractor
    ) {
      return {
        status:
          "center-not-aligned",
        centerAligned: false,
        baselineAligned: false
      };
    }

    return this.geometryEngine
      .checkProtractorAlignment({
        protractor:
          this.protractor,
        vertexPointId:
          this.getVertexPointId(),
        baselineRayId:
          this.step.firstRayId ||
          "ray-1",
        centerTolerance:
          this.step.centerTolerance ??
          16,
        rotationTolerance:
          this.step.rotationTolerance ??
          4
      });
  }

  getAlignmentFeedback() {
    if (
      this.protractor &&
      this.protractor.baselineLocked
    ) {
      return "קו ה־0° ננעל לקרן הראשונה. כעת קרא את הזווית.";
    }

    const alignment =
      this.getAlignmentStatus();

    if (
      alignment.status ===
      "center-not-aligned"
    ) {
      return "מקם את מרכז מד הזווית על קודקוד הזווית.";
    }

    if (
      alignment.status ===
      "baseline-not-aligned"
    ) {
      return "סובב את מד הזווית כך שקו ה־0° יהיה מונח על הקרן הראשונה.";
    }

    return "מד הזווית מוכן לקריאה. בדוק היכן הקרן השנייה פוגשת את הסקלה.";
  }

  getProtractorChangeFeedback(
    interactionEvent
  ) {
    const changeType =
      interactionEvent
        ? interactionEvent.type
        : null;

    if (
      changeType ===
      "center-snapped"
    ) {
      return "מרכז מד הזווית ננעל לקודקוד.";
    }

    if (
      changeType ===
      "baseline-snapped"
    ) {
      return "קו ה־0° ננעל לקרן הראשונה. כעת קרא את הזווית.";
    }

    return this.getAlignmentFeedback();
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
      showDegrees: false
    });
  }

  save() {
    const measuredDegrees =
      this.inputElement
        ? this.inputElement.value
        : this.appContext
            .lessonState
            .getActivityState(
              this.activityId
            ).data
            .measuredDegrees ?? "";

    this.appContext.lessonState
      .updateActivityData(
        this.activityId,
        {
          measuredDegrees,
          protractor:
            this.protractor
              ? this.protractor.toJSON()
              : null
        }
      );
  }

  validate() {
    this.save();

    if (
      this.actualDegrees === null ||
      !this.inputElement
    ) {
      return false;
    }

    const alignment =
      this.getAlignmentStatus();

    if (!alignment.centerAligned) {
      this.showFeedback(
        "מקם את מרכז מד הזווית על קודקוד הזווית."
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    if (!alignment.baselineAligned) {
      this.showFeedback(
        "סובב את מד הזווית כך שקו ה־0° יהיה מונח על הקרן הראשונה."
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    if (
      this.inputElement.value.trim() ===
      ""
    ) {
      this.showFeedback(
        "כתוב את גודל הזווית במעלות."
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    const studentValue =
      Number(
        this.inputElement.value
      );
    const tolerance =
      this.step.tolerance ?? 1;
    const isValid =
      Number.isFinite(
        studentValue
      ) &&
      studentValue >= 0 &&
      studentValue <= 180 &&
      Math.abs(
        studentValue -
          this.actualDegrees
      ) <= tolerance;

    if (!isValid) {
      this.showFeedback(
        "בדוק מאיזו סקלה צריך להתחיל לקרוא."
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    this.showFeedback(
      "המדידה נכונה."
    );
    this.appContext.lessonState
      .markCompleted(
        this.activityId
      );

    return true;
  }

  showFeedback(message) {
    if (this.feedbackElement) {
      this.feedbackElement.textContent =
        message;
    }
  }

  focus() {
    const alignment =
      this.getAlignmentStatus();

    if (
      (!alignment.centerAligned ||
        !alignment.baselineAligned) &&
      this.canvas &&
      this.canvas.element
    ) {
      this.canvas.element.focus();
      return;
    }

    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  clamp(value, minimum, maximum) {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );
  }

  escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  destroy() {
    if (
      this.inputElement &&
      this.boundInputHandler
    ) {
      this.inputElement.removeEventListener(
        "input",
        this.boundInputHandler
      );
    }

    if (
      this.submitButton &&
      this.boundSubmitHandler
    ) {
      this.submitButton.removeEventListener(
        "click",
        this.boundSubmitHandler
      );
    }

    if (this.canvas) {
      this.canvas.destroy();
    }

    this.canvas = null;
    this.workspace = null;
    this.geometryEngine = null;
    this.protractor = null;
    this.hasSavedProtractor = false;
    this.inputElement = null;
    this.feedbackElement = null;
    this.submitButton = null;
    this.boundInputHandler = null;
    this.boundSubmitHandler = null;
  }
}

window.MeasureAngleActivity =
  MeasureAngleActivity;
