class ActivityRenderer {
  constructor(appContext = {}) {
    this.appContext = appContext;
    this.activityTypes = new Map();
    this.currentActivity = null;
  }

  register(type, ActivityClass) {
    if (!type || typeof type !== "string") {
      throw new Error(
        "ActivityRenderer.register() requires a valid activity type."
      );
    }

    if (typeof ActivityClass !== "function") {
      throw new Error(
        `ActivityRenderer.register("${type}") requires an activity class.`
      );
    }

    this.activityTypes.set(type, ActivityClass);
  }

  has(type) {
    return this.activityTypes.has(type);
  }

  create(step) {
    if (!step || !step.type) {
      throw new Error(
        "ActivityRenderer.create() requires a step with a type."
      );
    }

    const ActivityClass = this.activityTypes.get(step.type);

    if (!ActivityClass) {
      throw new Error(
        `No activity is registered for type "${step.type}".`
      );
    }

    return new ActivityClass(step, this.appContext);
  }

  render(step) {
    this.destroyCurrentActivity();

    this.currentActivity = this.create(step);

    return this.currentActivity.render();
  }

  attach() {
    if (!this.currentActivity) {
      return;
    }

    this.currentActivity.attach();
  }

  validate() {
    if (!this.currentActivity) {
      return true;
    }

    return this.currentActivity.validate();
  }

  save() {
    if (!this.currentActivity) {
      return;
    }

    this.currentActivity.save();
  }

  destroyCurrentActivity() {
    if (!this.currentActivity) {
      return;
    }

    this.currentActivity.destroy();
    this.currentActivity = null;
  }

  getCurrentActivity() {
    return this.currentActivity;
  }
}

window.ActivityRenderer = ActivityRenderer;
