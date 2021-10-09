import { decodeProgram } from './util/encoder';

const defaultProgram = 't = time/100\nrotate(t)\nfill(1, 0, 0.8, 0.5)\ncube(1)';
const config = {
  keyMap: {default: 'default', lifetime: 'local'},
  lineNumbers: {default: false, lifetime: 'local'},
  theme: {default: 'improviz', lifetime: 'local'},
  performanceMode: {default: false, lifetime: 'session'},
  program: {default: defaultProgram, lifetime: 'local'}
};

export class Settings {
  constructor(
    eventBus,
    localStorage = window.localStorage,
    sessionStorage = window.sessionStorage,
  ) {
    this.eventBus = eventBus;
    this.localStorage = localStorage;
    this.sessionStorage = sessionStorage;
    this.settings = {};
  }

  load(params) {
    const s = this.settings;

    s.keyMap = this.loadSetting('keyMap');
    s.lineNumbers = this.loadSetting('lineNumbers');
    s.theme = this.loadSetting('theme');
    s.performanceMode = this.loadSetting('performanceMode');

    if (params.has('program')) {
      s.program = decodeProgram(params.get('program'));
    } else {
      s.program = this.loadSetting('program');
    }
  }

  loadSetting(key) {
    const c = config[key];
    if (c.lifetime === 'local') {
      const ls = this.localStorage.getItem(`improviz.${key}`);
      if (ls) return JSON.parse(ls);
    }

    if (c.lifetime === 'session') {
      const ss = this.sessionStorage.getItem(`improviz.${key}`);
      if (ss) return JSON.parse(ss);
    }

    return c.default;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return this.settings;
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSetting(key);
    this.eventBus.emit('settings', this.settings);
  }

  save() {
    this.saveSetting('keyMap');
    this.saveSetting('lineNumbers');
    this.saveSetting('theme');
    this.saveSetting('performanceMode');
    this.saveSetting('program');
  }

  saveSetting(key) {
    const c = config[key];
    if (!c) return;

    const v = JSON.stringify(this.settings[key]);
    if (c.lifetime === 'local') {
      this.localStorage.setItem(`improviz.${key}`, v);
    }
    if (c.lifetime === 'session') {
      this.sessionStorage.setItem(`improviz.${key}`, v);
    }
  }

  clear() {
    this.localStorage.clear();
    this.sessionStorage.clear();
  }

}
