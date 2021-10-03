export class LocalStorage {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  saveCode(code) {
    this.storage.setItem('improviz.code', code);
    return this;
  }
  loadCode() {
    return this.storage.getItem('improviz.code');
  }
}
