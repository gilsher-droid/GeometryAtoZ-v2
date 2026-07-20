class LessonEngine {
  constructor() {
    this.lesson = null;
    this.currentStepIndex = 0;
  }

  loadLesson(lesson) {
    this.lesson = lesson;
    this.currentStepIndex = 0;
  }

  getCurrentStep() {
    if (!this.lesson) {
      return null;
    }

    return this.lesson.steps[this.currentStepIndex];
  }

  nextStep() {
    if (!this.lesson) {
      return null;
    }

    if (this.currentStepIndex < this.lesson.steps.length - 1) {
      this.currentStepIndex += 1;
    }

    return this.getCurrentStep();
  }

  previousStep() {
    if (!this.lesson) {
      return null;
    }

    if (this.currentStepIndex > 0) {
      this.currentStepIndex -= 1;
    }

    return this.getCurrentStep();
  }

  getProgress() {
    if (!this.lesson || this.lesson.steps.length === 0) {
      return 0;
    }

    return Math.round(
      ((this.currentStepIndex + 1) / this.lesson.steps.length) * 100
    );
  }

  isFirstStep() {
    return this.currentStepIndex === 0;
  }

  isLastStep() {
    if (!this.lesson) {
      return false;
    }

    return this.currentStepIndex === this.lesson.steps.length - 1;
  }
}

window.lessonEngine = new LessonEngine();
