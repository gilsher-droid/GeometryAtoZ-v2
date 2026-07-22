class BaseActivity {
  constructor(step, appContext = {}) {
    this.step = step;
    this.appContext = appContext;
  }

  render() {
    throw new Error(
      `${this.constructor.name} must implement render().`
    );
  }

  attach() {
    // Optional
  }

  validate() {
    return true;
  }

  save() {
    // Optional
  }

  destroy() {
    // Optional
  }
}

window.BaseActivity = BaseActivity;
