class QuestionActivity extends BaseActivity {
  constructor(step, appContext = {}) {
    super(step, appContext);

    this.responseBox = null;
    this.responseKey = "";
  }

  render() {
    const {
      savedResponses,
      getStepKey,
      getResponseKey
    } = this.appContext;

    const stepKey = getStepKey(this.step);

    this.responseKey = getResponseKey(
      stepKey,
      "question"
    );

    const savedValue =
      savedResponses[this.responseKey] || "";

    const question =
      this.step.question ||
      this.step.prompt ||
      "כתוב את התשובה שלך.";

    this.responseBox = new ResponseBox({
      id: `response-${this.responseKey}`,
      label: question,
      placeholder:
        this.step.answerPlaceholder ||
        "כתוב כאן את התשובה שלך...",
      value: savedValue,
      buttonText: "שמור תשובה",

      onSave: (value) => {
        savedResponses[this.responseKey] = value;
      }
    });

    return `
      <div class="teacher-prompt">
        <strong>שאלת חשיבה:</strong>
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

    return (
      currentValue !== "" &&
      savedValue !== "" &&
      currentValue === savedValue
    );
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

window.QuestionActivity = QuestionActivity;
