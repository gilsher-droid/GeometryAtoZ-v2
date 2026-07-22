class LessonState {
  constructor() {
    this.reset();
  }

  initialize(lessonId) {
    this.lessonId = lessonId;
  }

  getActivityState(activityId) {
    if (!this.activities[activityId]) {
      this.activities[activityId] = {
        data: {},
        completed: false
      };
    }

    return this.activities[activityId];
  }

  updateActivityData(activityId, data) {
    const activity =
      this.getActivityState(activityId);

    activity.data = {
      ...activity.data,
      ...data
    };
  }

  markCompleted(activityId) {
    this.getActivityState(activityId).completed = true;
  }

  isCompleted(activityId) {
    return this.getActivityState(activityId).completed;
  }

  setCurrentStep(index) {
    this.currentStepIndex = index;
  }

  reset() {
    this.lessonId = null;
    this.currentStepIndex = 0;
    this.activities = {};
  }

  toJSON() {
    return {
      lessonId: this.lessonId,
      currentStepIndex: this.currentStepIndex,
      activities: this.activities
    };
  }
}

window.LessonState = LessonState;
