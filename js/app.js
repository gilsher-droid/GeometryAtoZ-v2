document.addEventListener("DOMContentLoaded", () => {
  const lessonContainer = document.getElementById("lesson-container");

  const studentAnswers = {};

  lessonEngine.loadLesson(lesson01);

  function getStepKey(step) {
    return step.id || `step-${lessonEngine.currentStepIndex}`;
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getStepQuestion(step) {
    return step.question || step.prompt || "";
  }

  function stepRequiresAnswer(step) {
    return Boolean(getStepQuestion(step));
  }

  function renderStep() {
    const step = lessonEngine.getCurrentStep();

    if (!step) {
      lessonContainer.innerHTML = `
        <section>
          <h2>לא נמצא שלב להצגה</h2>
        </section>
      `;
      return;
    }

    const progress = lessonEngine.getProgress();
    const isPointStep = step.interaction === "createPoint";
    const stepKey = getStepKey(step);
    const question = getStepQuestion(step);
    const savedAnswer = studentAnswers[stepKey] || "";
    const hasSavedAnswer = savedAnswer.trim().length > 0;

    lessonContainer.innerHTML = `
      <section class="lesson-step">
        <div class="progress-wrapper">
          <div class="progress-label">התקדמות: ${progress}%</div>

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

                  <div id="point-canvas" class="point-canvas"></div>

                  <p id="point-feedback" class="interaction-feedback">
                    ${
                      interactionEngine.isCompleted("createPoint")
                        ? "יצרת נקודה. עכשיו אפשר להמשיך."
                        : "עדיין לא נוצרה נקודה."
                    }
                  </p>
                </div>
              `
              : ""
          }

          ${
            question
              ? `
                <div class="teacher-prompt">
                  <strong>שאלת חשיבה:</strong>

                  <p>${question}</p>

                  <label for="student-answer">
                    כתוב את תשובתך:
                  </label>

                  <textarea
                    id="student-answer"
                    rows="4"
                    placeholder="${
                      step.answerPlaceholder ||
                      "כתוב כאן את התשובה שלך..."
                    }"
                  >${escapeHTML(savedAnswer)}</textarea>

                  <button
                    id="save-answer-button"
                    type="button"
                  >
                    שמור תשובה
                  </button>

                  <p
                    id="answer-feedback"
                    class="interaction-feedback"
                  >
                    ${
                      hasSavedAnswer
                        ? "התשובה נשמרה."
                        : "התשובה עדיין לא נשמרה."
                    }
                  </p>
                </div>
              `
              : ""
          }

          ${
            step.claimPrompt
              ? `
                <div class="claim-box">
                  <label for="claim-input">${step.claimPrompt}</label>

                  <textarea
                    id="claim-input"
                    rows="3"
                    placeholder="כתוב כאן את הטענה שלך"
                  ></textarea>
                </div>
              `
              : ""
          }

          ${
            step.justificationPrompt
              ? `
                <div class="justification-box">
                  <label for="justification-input">
                    ${step.justificationPrompt}
                  </label>

                  <textarea
                    id="justification-input"
                    rows="3"
                    placeholder="כתוב כאן את הצידוק שלך"
                  ></textarea>
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
                    .map((concept) => `<li>${concept}</li>`)
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

    if (isPointStep) {
      const pointCanvas = document.getElementById("point-canvas");
      const pointFeedback = document.getElementById("point-feedback");

      pointCanvas.addEventListener("click", (event) => {
        pointCanvas.innerHTML = "";

        const rect = pointCanvas.getBoundingClientRect();

        const point = document.createElement("div");
        point.className = "created-point";

        point.style.left = `${event.clientX - rect.left}px`;
        point.style.top = `${event.clientY - rect.top}px`;

        pointCanvas.appendChild(point);

        pointFeedback.textContent =
          "יצרת נקודה. עכשיו אפשר להמשיך.";

        interactionEngine.complete("createPoint");
      });
    }

    if (question) {
      const answerInput =
        document.getElementById("student-answer");

      const saveAnswerButton =
        document.getElementById("save-answer-button");

      const answerFeedback =
        document.getElementById("answer-feedback");

      saveAnswerButton.addEventListener("click", () => {
        const answer = answerInput.value.trim();

        if (!answer) {
          answerFeedback.textContent =
            "כתוב תשובה לפני השמירה.";

          answerInput.focus();
          return;
        }

        studentAnswers[stepKey] = answer;
        answerFeedback.textContent = "התשובה נשמרה.";
      });

      answerInput.addEventListener("input", () => {
        if (
          studentAnswers[stepKey] !== answerInput.value.trim()
        ) {
          answerFeedback.textContent =
            "יש שינויים שעדיין לא נשמרו.";
        }
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
      if (
        isPointStep &&
        !interactionEngine.isCompleted("createPoint")
      ) {
        alert(
          "כדי להמשיך, צור קודם נקודה בתוך שטח הפעילות."
        );
        return;
      }

      if (
        stepRequiresAnswer(step) &&
        !studentAnswers[stepKey]
      ) {
        alert(
          "כדי להמשיך, כתוב תשובה ולחץ על שמור תשובה."
        );
        return;
      }

      if (lessonEngine.isLastStep()) {
        lessonContainer.innerHTML = `
          <section class="lesson-complete">
            <h2>סיימת את השיעור הראשון</h2>

            <p>
              בנית את מפתח החשיבה הראשון:
              <strong>${lesson01.thinkingKey}</strong>
            </p>

            <button id="restart-button" type="button">
              להתחיל מחדש
            </button>
          </section>
        `;

        document
          .getElementById("restart-button")
          .addEventListener("click", () => {
            Object.keys(studentAnswers).forEach((key) => {
              delete studentAnswers[key];
            });

            interactionEngine.reset();
            lessonEngine.loadLesson(lesson01);
            renderStep();
          });

        return;
      }

      lessonEngine.nextStep();
      renderStep();
    });
  }

  renderStep();
});
