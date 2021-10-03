import { decodeProgram } from './util/encoder';

const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'improviz',
  performanceMode: false,
  program: 't = time/100\nrotate(t)\nfill(1, 0, 0.8, 0.5)\ncube(1)',
};

export class Configuration {
  constructor(cache, params) {

    this.keyMap = params.has('keymap')
      ? params.get('keymap')
      : defaultConfig.keyMap;

    this.lineNumbers = params.has('linenumbers') | defaultConfig.lineNumbers;

    this.theme = params.has('theme') ? params.get('theme') : defaultConfig.theme;

    this.performanceMode =
      params.has('performancemode') | defaultConfig.performanceMode;

    // TODO this could do with error handling
    this.program = defaultConfig.program;
    console.log('got program', this.program);
    if (params.has('program')) {
      console.log('loading program from URL param');
      this.program = decodeProgram(params.get('program'));
    } else if (cache.loadCode()) {
      console.log('loading program from storage cache');
      this.program = cache.loadCode();
    }

  }
}
