class InteractionEngine {
  constructor() {
    this.completedInteractions = new Set();
    this.listeners = {};
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);
  }

  emit(eventName, data = {}) {
    const callbacks = this.listeners[eventName] || [];

    callbacks.forEach(callback => {
      callback(data);
    });
  }

  complete(interactionName, data = {}) {
    this.completedInteractions.add(interactionName);

    this.emit("interactionCompleted", {
      interactionName,
      ...data
    });
  }

  isCompleted(interactionName) {
    return this.completedInteractions.has(interactionName);
  }

  reset() {
    this.completedInteractions.clear();
  }
}

window.interactionEngine = new InteractionEngine();
