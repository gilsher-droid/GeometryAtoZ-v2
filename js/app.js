document.addEventListener(
  "DOMContentLoaded",
  () => {
    const lessonContainer =
      document.getElementById(
        "lesson-container"
      );

    let isCompletionScreen =
      false;

    function updatePageChrome() {
      const appHeader =
        document.getElementById(
          "app-header"
        );
      const productSubtitle =
        document.getElementById(
          "product-subtitle"
        );
      const homeLink =
        document.getElementById(
          "fundamatics-home-link"
        );
      const welcomeTitle =
        document.getElementById(
          "welcome-title"
        );
      const welcomeText =
        document.getElementById(
          "welcome-text"
        );
      const startButton =
        document.getElementById(
          "start-button"
        );
      const languageSwitcher =
        document.querySelector(
          ".language-switcher"
        );

      if (appHeader) {
        appHeader.setAttribute(
          "aria-label",
          i18n.t("header.aria")
        );
      }

      if (productSubtitle) {
        productSubtitle.textContent =
          i18n.t(
            "header.subtitle"
          );
      }

      if (homeLink) {
        homeLink.textContent =
          i18n.t("header.home");
      }

      if (welcomeTitle) {
        welcomeTitle.textContent =
          i18n.t("welcome.title");
      }

      if (welcomeText) {
        welcomeText.textContent =
          i18n.t("welcome.text");
      }

      if (startButton) {
        startButton.textContent =
          i18n.t("welcome.start");
      }

      if (languageSwitcher) {
        languageSwitcher.setAttribute(
          "aria-label",
          i18n.t(
            "language.label"
          )
        );
      }

      document
        .querySelectorAll(
          ".language-option"
        )
        .forEach((button) => {
          const isActive =
            button.dataset.locale ===
            i18n.locale;

          button.classList.toggle(
            "is-active",
            isActive
          );
          button.setAttribute(
            "aria-pressed",
            String(isActive)
          );
        });
    }

    updatePageChrome();

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

      renderer.register(
        "measure-angle",
        MeasureAngleActivity
      );

      return renderer;
    }

    let activityRenderer =
      createActivityRenderer();

    function renderStep() {
      isCompletionScreen =
        false;

      const step =
        lessonEngine.getCurrentStep();

      if (!step) {
        lessonContainer.innerHTML = `
          <section class="lesson-step">
            <h2>
              ${i18n.t(
                "app.noStep"
              )}
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
              ${i18n.t(
                "app.progress",
                {
                  progress
                }
              )}
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
              ${i18n.t(
                "app.step",
                {
                  current:
                    lessonEngine
                      .currentStepIndex +
                    1,
                  total:
                    lesson01.steps
                      .length
                }
              )}
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
                      ${i18n.t(
                        "app.reflection"
                      )}
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
              ${i18n.t(
                "app.previous"
              )}
            </button>

            <button
              id="next-button"
              type="button"
            >
              ${
                lessonEngine
                  .isLastStep()
                  ? i18n.t(
                      "app.finish"
                    )
                  : i18n.t(
                      "app.next"
                    )
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
            const currentActivity =
              activityRenderer
                .getCurrentActivity();

            /*
              לחיצה על "הבא" מבצעת קודם
              את פעולת השמירה של הפעילות,
              אם קיימת מתודת save.
            */
            if (
              usesActivityRenderer &&
              currentActivity &&
              typeof currentActivity
                .save === "function"
            ) {
              currentActivity.save();
            }

            /*
              לאחר השמירה מתבצעת בדיקה
              האם הפעילות הושלמה.
            */
            if (
              usesActivityRenderer &&
              !activityRenderer.validate()
            ) {
              alert(
                i18n.t(
                  "app.incomplete"
                )
              );

              if (
                currentActivity &&
                typeof currentActivity
                  .focus === "function"
              ) {
                currentActivity.focus();
              }

              return;
            }

            /*
              אם זה השלב האחרון,
              מסיימים את השיעור.
            */
            if (
              lessonEngine.isLastStep()
            ) {
              renderCompletionScreen();
              return;
            }

            /*
              רק לאחר השמירה והבדיקה
              עוברים לשלב הבא.
            */
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
      isCompletionScreen =
        true;

      activityRenderer
        .destroyCurrentActivity();

      lessonContainer.innerHTML = `
        <section class="lesson-complete">
          <h2>
            ${i18n.t(
              "app.completeTitle"
            )}
          </h2>

          <p>
            ${i18n.t(
              "app.completeText"
            )}
            <strong>
              ${lesson01.thinkingKey}
            </strong>
          </p>

          <button
            id="restart-button"
            type="button"
          >
            ${i18n.t(
              "app.restart"
            )}
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

    document
      .querySelectorAll(
        ".language-option"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const nextLocale =
              button.dataset.locale;

            if (
              nextLocale ===
              i18n.locale
            ) {
              return;
            }

            const currentActivity =
              activityRenderer
                .getCurrentActivity();

            if (
              currentActivity &&
              typeof currentActivity
                .save === "function"
            ) {
              currentActivity.save();
            }

            i18n.setLocale(
              nextLocale
            );
          }
        );
      });

    window.addEventListener(
      "geometryatoz:localechange",
      () => {
        const currentStepIndex =
          lessonEngine
            .currentStepIndex;

        activityRenderer
          .destroyCurrentActivity();

        lesson01 =
          createLesson01();
        window.lesson01 =
          lesson01;

        lessonEngine.loadLesson(
          lesson01
        );
        lessonEngine
          .currentStepIndex =
          Math.min(
            currentStepIndex,
            lesson01.steps.length - 1
          );

        updatePageChrome();

        if (isCompletionScreen) {
          renderCompletionScreen();
        } else {
          renderStep();
        }
      }
    );

    renderStep();
  }
);
