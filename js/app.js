document.addEventListener("DOMContentLoaded", () => {
  const lessonContainer = document.getElementById("lesson-container");

  const savedResponses = {};
  const savedPointPositions = {};

  lessonEngine.loadLesson(lesson01);

  function getStepKey(step) {
    return step.id || `step-${lessonEngine.currentStepIndex}`;
  }

  function getResponseKey(stepKey, responseType) {
    return `${stepKey}-${responseType}`;
  }

  function getStepQuestion(step) {
    return step.question || step.prompt || "";
  }

  function createResponseBox({
    stepKey,
    responseType,
    label,
    placeholder,
    buttonText = "שמור תשובה"
  }) {
    if (!label) {
      return null;
    }

    const responseKey = getResponseKey(stepKey, responseType);
    const savedValue = savedResponses[responseKey] || "";

    return new ResponseBox({
      id: `response-${responseKey}`,
      label,
      placeholder,
      value: savedValue,
      buttonText,

      onSave: (value) => {
        savedResponses[responseKey] = value;
      }
    });
  }

  function responseBoxIsSaved(responseBox) {
    if (!responseBox) {
      return true;
    }

    const currentValue = responseBox.value.trim();
    const savedValue = responseBox.savedValue.trim();

    return (
      currentValue !== "" &&
      savedValue !== "" &&
      currentValue === savedValue
    );
  }

  function renderStep() {
    const step = lessonEngine.getCurrentStep();

    if (!step) {
      lessonContainer.innerHTML = `
        <section class="lesson-step">
          <h2>לא נמצא שלב להצגה</h2>
        </section>
      `;
      return;
    }

    const progress = lessonEngine.getProgress();
    const stepKey = getStepKey(step);
    const isPointStep = step.interaction === "createPoint";
    const question = getStepQuestion(step);

    const responseBoxes = [];

    const questionBox = createResponseBox({
      stepKey,
      responseType: "question",
      label: question,
      placeholder:
        step.answerPlaceholder ||
        "כתוב כאן את התשובה שלך...",
      buttonText: "שמור תשובה"
    });

    const claimBox = createResponseBox({
      stepKey,
      responseType: "claim",
      label: step.claimPrompt,
      placeholder: "כתוב כאן את הטענה שלך...",
      buttonText: "שמור טענה"
    });

    const justificationBox = createResponseBox({
      stepKey,
      responseType: "justification",
      label: step.justificationPrompt,
      placeholder: "כתוב כאן את הצידוק שלך...",
      buttonText: "שמור צידוק"
    });

    if (questionBox) {
      responseBoxes.push(questionBox);
    }

    if (claimBox) {
      responseBoxes.push(claimBox);
    }

    if (justificationBox) {
      responseBoxes.push(justificationBox);
    }

    lessonContainer.innerHTML = `
      <section class="lesson-step">
        <div class="progress-wrapper">
          <div class="progress-label">
            התקדמות: ${progress}%
          </div>

          <div class="progress-track">
            <div
              class="progress-bar"
              style="width: ${progress}%"
            ></div>
          </div>
        </div>

        <div class="step-content">
          <p class="step-number">
            שלב ${lessonEngine.currentStepIndex + 1}
            מתוך ${lesson01.steps.length}
          </p>

          <h2>${step.title}</h2>

          ${step.text ? `<p>${step.text}</p>` : ""}

          ${
            isPointStep
              ? `
                <div class="interaction-area">
                  <p class="interaction-instruction">
                    לחץ בתוך השטח כדי ליצור נקודה.
                  </p>

                  <div
                    id="point-canvas"
                    class="point-canvas"
                  ></div>

                  <p
                    id="point-feedback"
                    class="interaction-feedback"
                  >
                    ${
                      interactionEngine.isCompleted(
                        `createPoint-${stepKey}`
                      )
                        ? "יצרת נקודה. עכשיו אפשר להמשיך."
                        : "עדיין לא נוצרה נקודה."
                    }
                  </p>
                </div>
              `
              : ""
          }

          ${
            questionBox
              ? `
                <div class="teacher-prompt">
                  <strong>שאלת חשיבה:</strong>
                  ${questionBox.render()}
                </div>
              `
              : ""
          }

          ${
            claimBox
              ? `
                <div class="claim-box">
                  ${claimBox.render()}
                </div>
              `
              : ""
          }

          ${
            justificationBox
              ? `
                <div class="justification-box">
                  ${justificationBox.render()}
                </div>
              `
              : ""
          }

          ${
            step.reflection
              ? `
                <div class="reflection-box">
                  <strong>שאלה למחשבה:</strong>
                  <p>${step.reflection}</p>
                </div>
              `
              : ""
          }

          ${
            step.concepts
              ? `
                <ul class="concept-list">
                  ${step.concepts
                    .map(
                      (concept) => `<li>${concept}</li>`
                    )
                    .join("")}
                </ul>
              `
              : ""
          }
        </div>

        <div class="lesson-navigation">
          <button
            id="previous-button"
            type="button"
            ${lessonEngine.isFirstStep() ? "disabled" : ""}
          >
            הקודם
          </button>

          <button
            id="next-button"
            type="button"
          >
            ${lessonEngine.isLastStep() ? "סיום" : "הבא"}
          </button>
        </div>
      </section>
    `;

    responseBoxes.forEach((responseBox) => {
      responseBox.attach();
    });

    if (isPointStep) {
      const interactionKey = `createPoint-${stepKey}`;
      const pointCanvas =
        document.getElementById("point-canvas");

      const pointFeedback =
        document.getElementById("point-feedback");

      const savedPosition =
        savedPointPositions[stepKey];

      if (savedPosition) {
        drawPoint(
          pointCanvas,
          savedPosition.x,
          savedPosition.y
        );
      }

      pointCanvas.addEventListener("click", (event) => {
        const rect =
          pointCanvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        savedPointPositions[stepKey] = { x, y };

        drawPoint(pointCanvas, x, y);

        pointFeedback.textContent =
          "יצרת נקודה. עכשיו אפשר להמשיך.";

        interactionEngine.complete(interactionKey);
      });
    }

    const previousButton =
      document.getElementById("previous-button");

    const nextButton =
      document.getElementById("next-button");

    previousButton.addEventListener("click", () => {
      lessonEngine.previousStep();
      renderStep();
    });

    nextButton.addEventListener("click", () => {
      if (isPointStep) {
        const interactionKey =
          `createPoint-${stepKey}`;

        if (
          !interactionEngine.isCompleted(interactionKey)
        ) {
          alert(
            "כדי להמשיך, צור קודם נקודה בתוך שטח הפעילות."
          );
          return;
        }
      }

      const unsavedResponse =
        responseBoxes.find(
          (responseBox) =>
            !responseBoxIsSaved(responseBox)
        );

      if (unsavedResponse) {
        alert(
          "כדי להמשיך, כתוב תשובה ושמור את הגרסה האחרונה שלה."
        );

        const textarea =
          document.getElementById(
            unsavedResponse.id
          );

        if (textarea) {
          textarea.focus();
        }

        return;
      }

      if (lessonEngine.isLastStep()) {
        renderCompletionScreen();
        return;
      }

      lessonEngine.nextStep();
      renderStep();
    });
  }

  function drawPoint(pointCanvas, x, y) {
    pointCanvas.innerHTML = "";

    const point = document.createElement("div");

    point.className = "created-point";
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;

    pointCanvas.appendChild(point);
  }

  function renderCompletionScreen() {
    lessonContainer.innerHTML = `
      <section class="lesson-complete">
        <h2>סיימת את השיעור הראשון</h2>

        <p>
          בנית את מפתח החשיבה הראשון:
          <strong>${lesson01.thinkingKey}</strong>
        </p>

        <button
          id="restart-button"
          type="button"
        >
          להתחיל מחדש
        </button>
      </section>
    `;

    document
      .getElementById("restart-button")
      .addEventListener("click", () => {
        Object.keys(savedResponses).forEach(
          (key) => {
            delete savedResponses[key];
          }
        );

        Object.keys(savedPointPositions).forEach(
          (key) => {
            delete savedPointPositions[key];
          }
        );

        interactionEngine.reset();
        lessonEngine.loadLesson(lesson01);

        renderStep();
      });
  }

  renderStep();
});
