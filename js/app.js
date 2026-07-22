document.addEventListener(
  "DOMContentLoaded",
  () => {
    const lessonContainer =
      document.getElementById(
        "lesson-container"
      );

    lessonEngine.loadLesson(
      lesson01
    );

    /*
      Demo identity foundation.

      בעתיד הנתונים האלה יגיעו
      ממערכת התחברות או מבחירת תלמיד.
    */
    const teacher =
      new Teacher({
        id: "teacher-demo",
        name: "Demo Teacher"
      });

    const student =
      new Student({
        id: "student-demo",
        firstName: "Demo",
        lastName: "Student",
        teacherId: teacher.id
      });

    const book =
      new Book({
        id: "geometry-book",
        title: "Geometry A to Z",
        ownerId: student.id,
        teacherId: teacher.id
      });

    const bookManager =
      new BookManager();

    bookManager.initialize({
      teacher,
      student,
      book
    });

    const lessonId =
      lesson01.id ||
      "geometry-lesson-01";

    let lessonState =
      bookManager.getLessonState(
        lessonId
      );

    function getStepKey(step) {
      return (
        step.id ||
        `step-${lessonEngine.currentStepIndex}`
      );
    }

    function createActivityRenderer() {
      const renderer =
        new ActivityRenderer({
          lessonState,
          getStepKey
        });

      renderer.register(
        "question",
        QuestionActivity
      );

      renderer.register(
        "claim-justification",
        ClaimJustificationActivity
      );

renderer.register(
  "construction",
  ConstructionActivity
);

renderer.register(
  "ray-construction",
  RayConstructionActivity
);

renderer.register(
  "angle-construction",
  AngleConstructionActivity
);

      return renderer;
    }

    let activityRenderer =
      createActivityRenderer();

    function renderStep() {
      const step =
        lessonEngine.getCurrentStep();

      if (!step) {
        lessonContainer.innerHTML = `
          <section class="lesson-step">
            <h2>
              לא נמצא שלב להצגה
            </h2>
          </section>
        `;

        return;
      }

      lessonState.setCurrentStep(
        lessonEngine.currentStepIndex
      );

      const progress =
        lessonEngine.getProgress();

      const usesActivityRenderer =
        activityRenderer.has(
          step.type
        );

      let activityHtml = "";

      if (usesActivityRenderer) {
        activityHtml =
          activityRenderer.render(
            step
          );
      } else {
        activityRenderer
          .destroyCurrentActivity();
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
              שלב ${
                lessonEngine
                  .currentStepIndex + 1
              }
              מתוך ${lesson01.steps.length}
            </p>

            <h2>
              ${step.title}
            </h2>

            ${
              step.text
                ? `<p>${step.text}</p>`
                : ""
            }

            ${activityHtml}

            ${
              !usesActivityRenderer &&
              step.reflection
                ? `
                  <div class="reflection-box">
                    <strong>
                      שאלה למחשבה:
                    </strong>

                    <p>
                      ${step.reflection}
                    </p>
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
                        (concept) =>
                          `<li>${concept}</li>`
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
              ${
                lessonEngine
                  .isFirstStep()
                  ? "disabled"
                  : ""
              }
            >
              הקודם
            </button>

            <button
              id="next-button"
              type="button"
            >
              ${
                lessonEngine
                  .isLastStep()
                  ? "סיום"
                  : "הבא"
              }
            </button>
          </div>

        </section>
      `;

      if (usesActivityRenderer) {
        activityRenderer.attach();
      }

      attachNavigation({
        usesActivityRenderer
      });
    }

    function attachNavigation({
      usesActivityRenderer
    }) {
      const previousButton =
        document.getElementById(
          "previous-button"
        );

      const nextButton =
        document.getElementById(
          "next-button"
        );

      if (previousButton) {
        previousButton.addEventListener(
          "click",
          () => {
            lessonEngine.previousStep();

            lessonState.setCurrentStep(
              lessonEngine
                .currentStepIndex
            );

            renderStep();
          }
        );
      }

      if (nextButton) {
        nextButton.addEventListener(
          "click",
          () => {
            if (
              usesActivityRenderer &&
              !activityRenderer.validate()
            ) {
              alert(
                "כדי להמשיך, יש להשלים את הפעילות ולשמור את התשובה או הבנייה."
              );

              const currentActivity =
                activityRenderer
                  .getCurrentActivity();

              if (
                currentActivity &&
                typeof currentActivity
                  .focus === "function"
              ) {
                currentActivity.focus();
              }

              return;
            }

            if (
              lessonEngine.isLastStep()
            ) {
              renderCompletionScreen();
              return;
            }

            lessonEngine.nextStep();

            lessonState.setCurrentStep(
              lessonEngine
                .currentStepIndex
            );

            renderStep();
          }
        );
      }
    }

    function renderCompletionScreen() {
      activityRenderer
        .destroyCurrentActivity();

      lessonContainer.innerHTML = `
        <section class="lesson-complete">
          <h2>
            סיימת את השיעור הראשון
          </h2>

          <p>
            בנית את מפתח החשיבה הראשון:
            <strong>
              ${lesson01.thinkingKey}
            </strong>
          </p>

          <button
            id="restart-button"
            type="button"
          >
            להתחיל מחדש
          </button>
        </section>
      `;

      const restartButton =
        document.getElementById(
          "restart-button"
        );

      restartButton.addEventListener(
        "click",
        () => {
          activityRenderer
            .destroyCurrentActivity();

          interactionEngine.reset();

          /*
            מחיקת מצבי השיעורים
            מתוך הספר האישי.
          */
          book.lessons = {};
          book.touch();

          lessonEngine.loadLesson(
            lesson01
          );

          /*
            BookManager יוצר כעת
            LessonState חדש.
          */
          lessonState =
            bookManager
              .getLessonState(
                lessonId
              );

          /*
            ActivityRenderer חדש מקבל
            את LessonState החדש.
          */
          activityRenderer =
            createActivityRenderer();

          renderStep();
        }
      );
    }

    renderStep();
  }
);
