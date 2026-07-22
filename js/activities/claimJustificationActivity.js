class ClaimJustificationActivity
  extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.activityId = "";
    this.claimBox = null;
    this.justificationBox = null;
  }

  createResponseBoxes() {
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

    const claimValue =
      activityState.data.savedClaim ||
      activityState.data.claim ||
      "";

    const justificationValue =
      activityState.data
        .savedJustification ||
      activityState.data
        .justification ||
      "";

    this.claimBox =
      new ResponseBox({
        id:
          `response-${this.activityId}-claim`,
        label:
          this.step.claimPrompt ||
          "מהי הטענה שלך?",
        placeholder:
          "כתוב כאן את הטענה שלך...",
        value: claimValue,
        buttonText: "שמור טענה",

        onSave: (value) => {
          lessonState.updateActivityData(
            this.activityId,
            {
              claim: value,
              savedClaim: value
            }
          );
        }
      });

    this.justificationBox =
      new ResponseBox({
        id:
          `response-${this.activityId}-justification`,
        label:
          this.step
            .justificationPrompt ||
          "כיצד אפשר להצדיק את הטענה?",
        placeholder:
          "כתוב כאן את הצידוק שלך...",
        value: justificationValue,
        buttonText: "שמור צידוק",

        onSave: (value) => {
          lessonState.updateActivityData(
            this.activityId,
            {
              justification: value,
              savedJustification:
                value
            }
          );
        }
      });
  }

  render() {
    this.createResponseBoxes();

    return `
      <div
        class="reasoning-activity"
        data-activity-type="claim-justification"
      >
        <div class="claim-box">
          ${this.claimBox.render()}
        </div>

        <div class="justification-box">
          ${this.justificationBox.render()}
        </div>

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
    if (this.claimBox) {
      this.claimBox.attach();
    }

    if (this.justificationBox) {
      this.justificationBox.attach();
    }
  }

  responseBoxIsSaved(
    responseBox
  ) {
    if (!responseBox) {
      return false;
    }

    const currentValue =
      responseBox.value.trim();

    const savedValue =
      responseBox.savedValue.trim();

    return (
      currentValue !== "" &&
      savedValue !== "" &&
      currentValue === savedValue
    );
  }

  validate() {
    const isValid =
      this.responseBoxIsSaved(
        this.claimBox
      ) &&
      this.responseBoxIsSaved(
        this.justificationBox
      );

    if (isValid) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    return isValid;
  }

  focus() {
    if (
      !this.responseBoxIsSaved(
        this.claimBox
      )
    ) {
      const claimTextarea =
        document.getElementById(
          this.claimBox.id
        );

      if (claimTextarea) {
        claimTextarea.focus();
      }

      return;
    }

    if (
      !this.responseBoxIsSaved(
        this.justificationBox
      )
    ) {
      const justificationTextarea =
        document.getElementById(
          this.justificationBox.id
        );

      if (
        justificationTextarea
      ) {
        justificationTextarea.focus();
      }
    }
  }

  destroy() {
    this.claimBox = null;
    this.justificationBox = null;
  }
}

window.ClaimJustificationActivity =
  ClaimJustificationActivity;
