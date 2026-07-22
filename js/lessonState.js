class LessonState {
  constructor() {
    this.reset();
  }

  initialize(lessonId) {
    if (!lessonId) {
      throw new Error(
        "LessonState requires a valid lesson id."
      );
    }

    this.lessonId = lessonId;

    this.geometryWorkspace =
      new GeometryWorkspace({
        id: `${lessonId}-geometry-workspace`
      });
  }

  getActivityState(activityId) {
    if (!activityId) {
      throw new Error(
        "Activity state requires a valid activity id."
      );
    }

    if (!this.activities[activityId]) {
      this.activities[activityId] = {
        data: {},
        completed: false
      };
    }

    return this.activities[activityId];
  }

  updateActivityData(
    activityId,
    data
  ) {
    const activity =
      this.getActivityState(
        activityId
      );

    activity.data = {
      ...activity.data,
      ...data
    };
  }

  markCompleted(activityId) {
    const activity =
      this.getActivityState(
        activityId
      );

    activity.completed = true;
  }

  markIncomplete(activityId) {
    const activity =
      this.getActivityState(
        activityId
      );

    activity.completed = false;
  }

  isCompleted(activityId) {
    return this.getActivityState(
      activityId
    ).completed;
  }

  getGeometryWorkspace() {
    if (!this.geometryWorkspace) {
      if (!this.lessonId) {
        throw new Error(
          "LessonState must be initialized before accessing GeometryWorkspace."
        );
      }

      this.geometryWorkspace =
        new GeometryWorkspace({
          id:
            `${this.lessonId}-geometry-workspace`
        });
    }

    return this.geometryWorkspace;
  }

  setCurrentStep(index) {
    if (
      !Number.isInteger(index) ||
      index < 0
    ) {
      throw new Error(
        "Current step index must be a non-negative integer."
      );
    }

    this.currentStepIndex = index;
  }

  reset() {
    this.lessonId = null;
    this.currentStepIndex = 0;
    this.activities = {};
    this.geometryWorkspace = null;
  }

  toJSON() {
    return {
      lessonId:
        this.lessonId,

      currentStepIndex:
        this.currentStepIndex,

      activities:
        this.activities,

      geometryWorkspace:
        this.geometryWorkspace
          ? this.geometryWorkspace
              .toJSON()
          : null
    };
  }
}

window.LessonState =
  LessonState;
