class QuestionActivity
  extends BaseActivity {
  constructor(
    step,
    appContext = {}
  ) {
    super(
      step,
      appContext
    );

    this.responseBox = null;
    this.activityId = "";
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

        label:
          question,

        placeholder:
          this.step.answerPlaceholder ||
          this.step.placeholder ||
          "כתוב כאן את התשובה שלך...",

        value:
          savedValue,

        /*
          כפתור השמירה מוסתר.
          השמירה מתבצעת אוטומטית
          בזמן ההקלדה ובמעבר לשלב הבא.
        */
        showSaveButton: false,

        onChange:
          (value) => {
            this.saveValue(
              value
            );
          },

        onSave:
          (value) => {
            this.saveValue(
              value
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

    const textarea =
      document.getElementById(
        this.responseBox.id
      );

    if (!textarea) {
      return;
    }

    /*
      גיבוי ל-Auto Save במקרה
      ש-ResponseBox עדיין לא תומך
      באירוע onChange.
    */
    textarea.addEventListener(
      "input",
      () => {
        this.saveValue(
          textarea.value
        );
      }
    );
  }

  save() {
    if (!this.responseBox) {
      return;
    }

    this.saveValue(
      this.responseBox.value
    );
  }

  saveValue(value) {
    const normalizedValue =
      typeof value === "string"
        ? value
        : "";

    this.appContext.lessonState
      .updateActivityData(
        this.activityId,
        {
          value:
            normalizedValue,

          savedValue:
            normalizedValue
        }
      );

    if (this.responseBox) {
      this.responseBox.value =
        normalizedValue;

      this.responseBox.savedValue =
        normalizedValue;
    }
  }

  validate() {
    if (!this.responseBox) {
      return true;
    }

    /*
      מבצעים שמירה נוספת לפני הבדיקה,
      כדי שגם הקלדה מיד לפני לחיצה
      על "הבא" תישמר.
    */
    this.save();

    const currentValue =
      this.responseBox.value.trim();

    const isValid =
      currentValue !== "";

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
