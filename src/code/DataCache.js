export class DataCache {
  constructor(
    localStorage = window.localStorage
  ) {
    this.localStorage = localStorage;
  }

  save(key, data) {
    this.localStorage.setItem(`improviz.data.${key}`, JSON.stringify(data));
  }

  load(key) {
    return JSON.parse(
      this.localStorage.getItem(`improviz.data.${key}`)
    );
  }


}
