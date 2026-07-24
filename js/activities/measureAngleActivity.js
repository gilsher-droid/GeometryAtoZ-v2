const PHYSICAL_PROTRACTOR_LEARNING_MOMENT =
  Object.freeze({
    provider: "youtube",
    videoId: "-SW1jEGFS6A"
  });

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
    this.centerLockButton = null;
    this.baselineLockButton = null;
    this.learningMomentButton = null;
    this.learningMomentContent = null;
    this.learningMomentVideo = null;

    this.actualDegrees = null;
    this.hasSavedProtractor = false;
    this.boundInputHandler = null;
    this.boundSubmitHandler = null;
    this.boundCenterLockHandler =
      null;
    this.boundBaselineLockHandler =
      null;
    this.boundLearningMomentClickHandler =
      null;
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
    const displayedSavedValue =
      this.normalizeMeasurementInput(
        savedValue
      );
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
    const hasExplicitLockState =
      Object.prototype
        .hasOwnProperty.call(
          savedProtractor,
          "centerSnapped"
        ) ||
      Object.prototype
        .hasOwnProperty.call(
          savedProtractor,
          "baselineSnapped"
        );

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
          this.getBaselineRayId(),
        centerSnapped:
          hasExplicitLockState
            ? savedProtractor
                .centerSnapped ??
              false
            : savedProtractor
                .centerLocked ??
              false,
        baselineSnapped:
          hasExplicitLockState
            ? savedProtractor
                .baselineSnapped ??
              false
            : savedProtractor
                .baselineLocked ??
              false,
        centerLocked:
          hasExplicitLockState
            ? savedProtractor
                .centerLocked ??
              false
            : false,
        baselineLocked:
          hasExplicitLockState
            ? savedProtractor
                .baselineLocked ??
              false
            : false
      });

    this.restoreProtractorState();

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
      i18n.t(
        "lesson.measure.instruction"
      );

    return `
      <div
        class="construction-activity measure-angle-activity"
        data-activity-type="measure-angle"
      >
        <p class="interaction-instruction">
          ${instruction}
        </p>

        <aside
          class="learning-moment"
          aria-label="${i18n.t(
            "measure.learningMomentAria"
          )}"
        >
          <button
            id="learning-moment-button-${this.activityId}"
            class="learning-moment-button"
            type="button"
            aria-expanded="false"
            aria-controls="learning-moment-content-${this.activityId}"
          >
            ${i18n.t(
              "measure.learningMomentButton"
            )}
          </button>

          <div
            id="learning-moment-content-${this.activityId}"
            class="learning-moment-content"
            role="region"
            aria-labelledby="learning-moment-button-${this.activityId}"
            hidden
          >
            <figure class="learning-moment-media">
              <div class="learning-moment-video-frame">
                <iframe
                  id="learning-moment-video-${this.activityId}"
                  class="learning-moment-video"
                  src="${this.getLearningMomentVideoUrl()}"
                  title="${i18n.t(
                    "measure.videoTitle"
                  )}"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>

              <figcaption>
                <p>
                  <strong>
                    ${i18n.t(
                      "measure.visualDescriptionLabel"
                    )}
                  </strong>
                  ${i18n.t(
                    "measure.visualDescription"
                  )}
                </p>
                <p>
                  <strong>
                    ${i18n.t(
                      "measure.transcriptLabel"
                    )}
                  </strong>
                  ${i18n.t(
                    "measure.transcript"
                  )}
                </p>
              </figcaption>
            </figure>
          </div>
        </aside>

        ${
          !angle
            ? `
              <p class="interaction-feedback">
                ${i18n.t(
                  "measure.noAngle"
                )}
              </p>
            `
            : ""
        }

        <div
          class="protractor-lock-controls"
          role="group"
          aria-label="${i18n.t(
            "measure.lockControlsAria"
          )}"
        >
          <button
            id="center-lock-${this.activityId}"
            class="protractor-lock-button"
            type="button"
            ${
              this.isCenterLockControlEnabled()
                ? ""
                : "disabled"
            }
          >
            ${this.getCenterLockLabel()}
          </button>

          <button
            id="baseline-lock-${this.activityId}"
            class="protractor-lock-button"
            type="button"
            ${
              this.isBaselineLockControlEnabled()
                ? ""
                : "disabled"
            }
          >
            ${this.getBaselineLockLabel()}
          </button>
        </div>

        ${this.canvas.render()}

        <div class="measure-angle-response">
          <label
            for="angle-answer-${this.activityId}"
          >
            <strong>
              ${i18n.t(
                "measure.answerPrompt"
              )}
            </strong>
          </label>

          <div class="measure-angle-controls">
            <span class="measure-angle-input">
              <input
                id="angle-answer-${this.activityId}"
                type="number"
                min="0"
                max="180"
                step="1"
                inputmode="numeric"
                value="${this.escapeAttribute(displayedSavedValue)}"
                placeholder="${i18n.t(
                  "measure.answerPlaceholder"
                )}"
                ${angle ? "" : "disabled"}
              />
              <span
                class="measure-angle-degree-symbol"
                aria-hidden="true"
              >°</span>
            </span>

            <button
              id="measure-submit-${this.activityId}"
              type="button"
              ${angle ? "" : "disabled"}
            >
              ${i18n.t(
                "measure.check"
              )}
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
              this.updateLockControls();
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
    this.centerLockButton =
      document.getElementById(
        `center-lock-${this.activityId}`
      );
    this.baselineLockButton =
      document.getElementById(
        `baseline-lock-${this.activityId}`
      );
    this.learningMomentButton =
      document.getElementById(
        `learning-moment-button-${this.activityId}`
      );
    this.learningMomentContent =
      document.getElementById(
        `learning-moment-content-${this.activityId}`
      );
    this.learningMomentVideo =
      document.getElementById(
        `learning-moment-video-${this.activityId}`
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
    this.boundCenterLockHandler =
      () => {
        this.toggleCenterLock();
      };
    this.boundBaselineLockHandler =
      () => {
        this.toggleBaselineLock();
      };
    this.boundLearningMomentClickHandler =
      () => {
        if (
          this.learningMomentButton &&
          this.learningMomentContent
        ) {
          const isExpanded =
            this.learningMomentButton
              .getAttribute(
                "aria-expanded"
              ) === "true";

          if (
            isExpanded &&
            this.learningMomentVideo
          ) {
            this.pauseLearningMomentVideo();
          }

          this.learningMomentButton
            .setAttribute(
              "aria-expanded",
              String(!isExpanded)
            );
          this.learningMomentContent
            .hidden = isExpanded;
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

    if (this.centerLockButton) {
      this.centerLockButton
        .addEventListener(
          "click",
          this.boundCenterLockHandler
        );
    }

    if (this.baselineLockButton) {
      this.baselineLockButton
        .addEventListener(
          "click",
          this.boundBaselineLockHandler
        );
    }

    if (this.learningMomentButton) {
      this.learningMomentButton
        .addEventListener(
          "click",
          this.boundLearningMomentClickHandler
        );
    }

    this.updateLockControls();
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

  getLearningMomentVideoUrl() {
    if (
      PHYSICAL_PROTRACTOR_LEARNING_MOMENT
        .provider !== "youtube"
    ) {
      return "";
    }

    const videoId =
      PHYSICAL_PROTRACTOR_LEARNING_MOMENT
        .videoId;

    return (
      "https://www.youtube-nocookie.com/embed/" +
      `${videoId}?enablejsapi=1&rel=0`
    );
  }

  pauseLearningMomentVideo() {
    if (
      !this.learningMomentVideo ||
      !this.learningMomentVideo
        .contentWindow
    ) {
      return;
    }

    this.learningMomentVideo
      .contentWindow
      .postMessage(
        JSON.stringify({
          event: "command",
          func: "pauseVideo",
          args: []
        }),
        "https://www.youtube-nocookie.com"
      );
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
            this.getBaselineRayId()
          )
        : null;

    return firstRay
      ? firstRay.originPointId
      : "point-A";
  }

  getBaselineRayId() {
    return (
      this.step.baselineRayId ||
      this.step.firstRayId ||
      null
    );
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
      this.getBaselineRayId();

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

  restoreProtractorState() {
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
      !vertex
    ) {
      this.protractor.update({
        centerSnapped: false,
        baselineSnapped: false,
        centerLocked: false,
        baselineLocked: false
      });
      return;
    }

    if (
      this.protractor.centerLocked ||
      this.protractor.centerSnapped
    ) {
      this.protractor.setPosition(
        vertex.x,
        vertex.y
      );
    }

    if (
      !this.protractor.baselineLocked &&
      !this.protractor.baselineSnapped
    ) {
      return;
    }

    const baselineTarget =
      this.geometryEngine
        .getClosestBaselineRotation({
          rotation:
            this.protractor.rotation,
          rayId:
            this.getBaselineRayId()
        });

    if (!baselineTarget) {
      this.protractor.update({
        baselineSnapped: false,
        baselineLocked: false
      });
      return;
    }

    this.protractor.update({
      rotation:
        baselineTarget.rotation,
      centerLocked:
        this.protractor
          .baselineLocked
          ? true
          : this.protractor
              .centerLocked,
      baselineSnapped:
        this.protractor
          .baselineLocked
          ? false
          : this.protractor
              .baselineSnapped,
      baselineLocked:
        this.protractor
          .baselineLocked
    });
  }

  getCenterLockLabel() {
    return (
      this.protractor &&
      this.protractor.centerLocked
    )
      ? i18n.t(
          "measure.unlockCenter"
        )
      : i18n.t(
          "measure.lockCenter"
        );
  }

  getBaselineLockLabel() {
    return (
      this.protractor &&
      this.protractor.baselineLocked
    )
      ? i18n.t(
          "measure.unlockBaseline"
        )
      : i18n.t(
          "measure.lockBaseline"
        );
  }

  isCenterLockControlEnabled() {
    if (
      !this.protractor ||
      this.actualDegrees === null
    ) {
      return false;
    }

    return (
      this.protractor.centerLocked ||
      this.getAlignmentStatus()
        .centerAligned
    );
  }

  getBaselineLockTarget() {
    if (
      !this.geometryEngine ||
      !this.protractor
    ) {
      return null;
    }

    return this.geometryEngine
      .getClosestBaselineRotation({
        rotation:
          this.protractor.rotation,
        rayId:
          this.getBaselineRayId()
      });
  }

  isBaselineLockControlEnabled() {
    if (
      !this.protractor ||
      this.actualDegrees === null
    ) {
      return false;
    }

    if (this.protractor.baselineLocked) {
      return true;
    }

    const alignment =
      this.getAlignmentStatus();
    const target =
      this.getBaselineLockTarget();

    return Boolean(
      alignment.centerAligned &&
      target &&
      target.difference <=
        (
          this.step
            .baselineSnapTolerance ??
          6
        )
    );
  }

  updateLockControls() {
    if (this.centerLockButton) {
      this.centerLockButton.textContent =
        this.getCenterLockLabel();
      this.centerLockButton.disabled =
        !this.isCenterLockControlEnabled();
      this.centerLockButton
        .setAttribute(
          "aria-pressed",
          String(
            this.protractor
              ? this.protractor
                  .centerLocked
              : false
          )
        );
    }

    if (this.baselineLockButton) {
      this.baselineLockButton
        .textContent =
          this.getBaselineLockLabel();
      this.baselineLockButton.disabled =
        !this
          .isBaselineLockControlEnabled();
      this.baselineLockButton
        .setAttribute(
          "aria-pressed",
          String(
            this.protractor
              ? this.protractor
                  .baselineLocked
              : false
          )
        );
    }
  }

  toggleCenterLock() {
    if (
      !this.protractor ||
      !this.canvas
    ) {
      return;
    }

    if (this.protractor.centerLocked) {
      this.protractor.update({
        centerLocked: false,
        baselineLocked: false,
        centerSnapped: true,
        baselineSnapped:
          this.protractor
            .baselineLocked ||
          this.protractor
            .baselineSnapped
      });
      this.canvas.updateProtractor();
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      this.save();
      this.updateLockControls();
      this.showFeedback(
        i18n.t(
          "measure.centerReleased"
        )
      );
      return;
    }

    if (
      !this.isCenterLockControlEnabled()
    ) {
      return;
    }

    const vertex =
      this.geometryEngine.getPoint(
        this.getVertexPointId()
      );

    if (!vertex) {
      return;
    }

    this.protractor.update({
      x: vertex.x,
      y: vertex.y,
      centerSnapped: false,
      centerLocked: true
    });
    this.canvas.updateProtractor();
    this.appContext.lessonState
      .markIncomplete(
        this.activityId
      );
    this.save();
    this.updateLockControls();
    this.showFeedback(
      i18n.t(
        "measure.centerLocked"
      )
    );
  }

  toggleBaselineLock() {
    if (
      !this.protractor ||
      !this.canvas
    ) {
      return;
    }

    if (this.protractor.baselineLocked) {
      this.protractor.update({
        baselineLocked: false,
        baselineSnapped: true
      });
      this.canvas.updateProtractor();
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      this.save();
      this.updateLockControls();
      this.showFeedback(
        i18n.t(
          "measure.baselineReleased"
        )
      );
      return;
    }

    if (
      !this.isBaselineLockControlEnabled()
    ) {
      return;
    }

    const vertex =
      this.geometryEngine.getPoint(
        this.getVertexPointId()
      );
    const target =
      this.getBaselineLockTarget();

    if (!vertex || !target) {
      return;
    }

    this.protractor.update({
      x: vertex.x,
      y: vertex.y,
      rotation: target.rotation,
      centerSnapped: false,
      baselineSnapped: false,
      centerLocked: true,
      baselineLocked: true
    });
    this.canvas.updateProtractor();
    this.appContext.lessonState
      .markIncomplete(
        this.activityId
      );
    this.save();
    this.updateLockControls();
    this.showFeedback(
      i18n.t(
        "measure.baselineLocked"
      )
    );
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
          this.getBaselineRayId(),
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
      return i18n.t(
        "measure.baselineLocked"
      );
    }

    if (
      this.protractor &&
      this.protractor.baselineSnapped
    ) {
      return i18n.t(
        "measure.baselineTemporarilySnapped"
      );
    }

    const alignment =
      this.getAlignmentStatus();

    if (
      alignment.status ===
      "center-not-aligned"
    ) {
      return i18n.t(
        "measure.positionCenter"
      );
    }

    if (
      alignment.status ===
      "baseline-not-aligned"
    ) {
      return i18n.t(
        "measure.alignBaseline"
      );
    }

    return i18n.t(
      "measure.ready"
    );
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
      return i18n.t(
        "measure.centerTemporarilySnapped"
      );
    }

    if (
      changeType ===
      "baseline-snapped"
    ) {
      return i18n.t(
        "measure.baselineTemporarilySnapped"
      );
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
        i18n.t(
          "measure.positionCenter"
        )
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    if (!alignment.baselineAligned) {
      this.showFeedback(
        i18n.t(
          "measure.alignFirstRay"
        )
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    const studentValue =
      this.parseMeasurementAnswer(
        this.inputElement.value
      );

    if (studentValue === null) {
      this.showFeedback(
        i18n.t(
          "measure.enterAnswer"
        )
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    const tolerance =
      this.step
        .answerToleranceDegrees ??
      this.step.tolerance ??
      1;
    const isValid =
      this.isWholeDegreeMeasurementCorrect(
        studentValue,
        this.actualDegrees,
        tolerance
      );

    if (!isValid) {
      this.showFeedback(
        i18n.t(
          "measure.wrongScale"
        )
      );
      this.appContext.lessonState
        .markIncomplete(
          this.activityId
        );
      return false;
    }

    this.showFeedback(
      i18n.t(
        "measure.correct"
      )
    );
    this.appContext.lessonState
      .markCompleted(
        this.activityId
      );

    return true;
  }

  normalizeMeasurementInput(value) {
    return String(value ?? "")
      .trim()
      .replace(",", ".");
  }

  parseMeasurementAnswer(value) {
    const normalizedValue =
      this.normalizeMeasurementInput(
        value
      );

    if (
      normalizedValue === "" ||
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(
        normalizedValue
      )
    ) {
      return null;
    }

    const numericValue =
      Number(normalizedValue);

    return Number.isFinite(
      numericValue
    )
      ? numericValue
      : null;
  }

  getSmallerAngleDegrees(
    actualAngle
  ) {
    const numericAngle =
      Number(actualAngle);

    if (
      !Number.isFinite(
        numericAngle
      )
    ) {
      return null;
    }

    const normalizedAngle =
      ((numericAngle % 360) +
        360) %
      360;

    return normalizedAngle > 180
      ? 360 - normalizedAngle
      : normalizedAngle;
  }

  isWholeDegreeMeasurementCorrect(
    enteredAnswer,
    actualAngle,
    tolerance = 1
  ) {
    const numericAnswer =
      Number(enteredAnswer);
    const smallerAngle =
      this.getSmallerAngleDegrees(
        actualAngle
      );
    const numericTolerance =
      Number(tolerance);

    if (
      !Number.isFinite(
        numericAnswer
      ) ||
      !Number.isInteger(
        numericAnswer
      ) ||
      numericAnswer < 0 ||
      numericAnswer > 180 ||
      smallerAngle === null
    ) {
      return false;
    }

    const expectedAnswer =
      Math.round(smallerAngle);
    const enteredWholeDegrees =
      Math.round(numericAnswer);
    const allowedDifference =
      Number.isFinite(
        numericTolerance
      )
        ? Math.max(
            0,
            numericTolerance
          )
        : 1;

    return Math.abs(
      enteredWholeDegrees -
        expectedAnswer
    ) <= allowedDifference;
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

    if (
      this.centerLockButton &&
      this.boundCenterLockHandler
    ) {
      this.centerLockButton
        .removeEventListener(
          "click",
          this.boundCenterLockHandler
        );
    }

    if (
      this.baselineLockButton &&
      this.boundBaselineLockHandler
    ) {
      this.baselineLockButton
        .removeEventListener(
          "click",
          this.boundBaselineLockHandler
        );
    }

    if (
      this.learningMomentButton &&
      this.boundLearningMomentClickHandler
    ) {
      this.learningMomentButton
        .removeEventListener(
          "click",
          this.boundLearningMomentClickHandler
        );
    }

    if (this.learningMomentVideo) {
      this.pauseLearningMomentVideo();
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
    this.centerLockButton = null;
    this.baselineLockButton = null;
    this.learningMomentButton = null;
    this.learningMomentContent = null;
    this.learningMomentVideo = null;
    this.boundInputHandler = null;
    this.boundSubmitHandler = null;
    this.boundCenterLockHandler =
      null;
    this.boundBaselineLockHandler =
      null;
    this.boundLearningMomentClickHandler =
      null;
  }
}

window.MeasureAngleActivity =
  MeasureAngleActivity;
