document.addEventListener("DOMContentLoaded", () => {
  const lessonContainer = document.getElementById("lesson-container");

  lessonEngine.loadLesson(lesson01);

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
                    עדיין לא נוצרה נקודה.
                  </p>
                </div>
              `
              : ""
          }

          ${
            step.prompt
              ? `
                <div class="teacher-prompt">
                  <strong>שאלת חשיבה:</strong>
                  <p>${step.prompt}</p>
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

      if (interactionEngine.isCompleted("createPoint")) {
        pointFeedback.textContent = "יצרת נקודה. עכשיו אפשר להמשיך.";
      }

      pointCanvas.addEventListener("click", (event) => {
        pointCanvas.innerHTML = "";

        const rect = pointCanvas.getBoundingClientRect();

        const point = document.createElement("div");
        point.className = "created-point";

        point.style.left = `${event.clientX - rect.left}px`;
        point.style.top = `${event.clientY - rect.top}px`;

        pointCanvas.appendChild(point);

        pointFeedback.textContent = "יצרת נקודה. עכשיו אפשר להמשיך.";

        interactionEngine.complete("createPoint");
      });
    }

    const previousButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");

    previousButton.addEventListener("click", () => {
      lessonEngine.previousStep();
      renderStep();
    });

    nextButton.addEventListener("click", () => {
      if (
        step.interaction === "createPoint" &&
        !interactionEngine.isCompleted("createPoint")
      ) {
        alert("כדי להמשיך, צור קודם נקודה בתוך שטח הפעילות.");
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
