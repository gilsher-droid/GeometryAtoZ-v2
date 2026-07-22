class ClaimJustificationActivity extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.claimBox = null;
    this.justificationBox = null;

    this.createResponseBoxes();
  }

  createResponseBoxes() {
    const {
      savedResponses,
      getStepKey,
      getResponseKey
    } = this.appContext;

    const stepKey = getStepKey(this.step);

    const claimKey = getResponseKey(
      stepKey,
      "claim"
    );

    const justificationKey = getResponseKey(
      stepKey,
      "justification"
    );

    this.claimBox = new ResponseBox({
      id: `response-${claimKey}`,
      label:
        this.step.claimPrompt ||
        "מהי הטענה שלך?",
      placeholder:
        "כתוב כאן את הטענה שלך...",
      value:
        savedResponses[claimKey] || "",
      buttonText: "שמור טענה",

      onSave: (value) => {
        savedResponses[claimKey] =
          value;
      }
    });

    this.justificationBox =
      new ResponseBox({
        id:
          `response-${justificationKey}`,
        label:
          this.step
            .justificationPrompt ||
          "כיצד אפשר להצדיק את הטענה?",
        placeholder:
          "כתוב כאן את הצידוק שלך...",
        value:
          savedResponses[
            justificationKey
          ] || "",
        buttonText: "שמור צידוק",

        onSave: (value) => {
          savedResponses[
            justificationKey
          ] = value;
        }
      });
  }

  render() {
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
    this.claimBox.attach();
    this.justificationBox.attach();
  }

  responseBoxIsSaved(responseBox) {
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
    return (
      this.responseBoxIsSaved(
        this.claimBox
      ) &&
      this.responseBoxIsSaved(
        this.justificationBox
      )
    );
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

      if (justificationTextarea) {
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
