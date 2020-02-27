export class EventBus {
  constructor() {
    this.listeners = {};
  }

  _getEventListeners(eventName) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set();
    }
    return this.listeners[eventName];
  }

  on(eventName, callback) {
    this._getEventListeners(eventName).add(callback);
    return this;
  }

  once(eventName, callback) {
    this.on(eventName, () => {
      this.removeListener(eventName, callback);
      callback();
    });
    return this;
  }

  emit(eventName, ...args) {
    this._getEventListeners(eventName).forEach(cb => {
      cb(...args);
    });
    return this;
  }

  removeListener(eventName, callback) {
    this._getEventListeners(eventName).delete(callback);
    return this;
  }
}
