class QuestionActivity extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.responseBox = null;
    this.activityId = "";
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

    const savedValue =
      activityState.data.savedValue ||
      activityState.data.value ||
      "";

    const question =
      this.step.question ||
      this.step.prompt ||
      this.step.responsePrompt ||
      "כתוב את התשובה שלך.";

    this.responseBox =
      new ResponseBox({
        id:
          `response-${this.activityId}-question`,
        label: question,
        placeholder:
          this.step.answerPlaceholder ||
          this.step.placeholder ||
          "כתוב כאן את התשובה שלך...",
        value: savedValue,
        buttonText: "שמור תשובה",

        onSave: (value) => {
          lessonState.updateActivityData(
            this.activityId,
            {
              value,
              savedValue: value
            }
          );
        }
      });

    return `
      <div
        class="teacher-prompt"
        data-activity-type="question"
      >
        <strong>
          שאלת חשיבה:
        </strong>

        ${this.responseBox.render()}
      </div>
    `;
  }

  attach() {
    if (!this.responseBox) {
      return;
    }

    this.responseBox.attach();
  }

  validate() {
    if (!this.responseBox) {
      return true;
    }

    const currentValue =
      this.responseBox.value.trim();

    const savedValue =
      this.responseBox.savedValue.trim();

    const isValid =
      currentValue !== "" &&
      savedValue !== "" &&
      currentValue === savedValue;

    if (isValid) {
      this.appContext.lessonState
        .markCompleted(
          this.activityId
        );
    }

    return isValid;
  }

  focus() {
    if (!this.responseBox) {
      return;
    }

    const textarea =
      document.getElementById(
        this.responseBox.id
      );

    if (textarea) {
      textarea.focus();
    }
  }

  destroy() {
    this.responseBox = null;
  }
}

window.QuestionActivity =
  QuestionActivity;
