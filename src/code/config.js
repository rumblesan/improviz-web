import { decodeProgram } from './encoder';

const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'improviz',
  performanceMode: false,
  program: 'position.x -> osc(5) >> out;',
};

export function getConfig() {
  const params = URL.fromLocation().searchParams;

  const keyMap = params.has('keymap')
    ? params.get('keymap')
    : defaultConfig.keyMap;

  const lineNumbers = params.has('linenumbers') | defaultConfig.lineNumbers;

  const theme = params.has('theme') ? params.get('theme') : defaultConfig.theme;

  const performanceMode =
    params.has('performancemode') | defaultConfig.performanceMode;

  // TODO this could do with error handling
  const program = params.has('program')
    ? decodeProgram(params.get('program'))
    : defaultConfig.program;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
    program,
  };
}
