export class CrossFrameSetting {
  constructor(defaultValue) {
    this.default = defaultValue;
    this.current = defaultValue;
    this.setLastFrame = false;
    this.useCurrent = false;
  }
  set(setting) {
    this.current = setting;
    this.setLastFrame = true;
    this.useCurrent = true;
  }
  get() {
    return this.useCurrent ? this.current : this.default;
  }
  reset() {
    this.useCurrent = this.setLastFrame;
    this.setLastFrame = false;
  }
}
