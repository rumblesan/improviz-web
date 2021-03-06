import './index.html';
import './favicon.ico';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import './styles/main.scss';

import CodeMirror from 'codemirror';
import 'codemirror/keymap/vim';
import 'codemirror/addon/lint/lint.js';
import defineImprovizMode from './code/editor/improviz-mode';
defineImprovizMode(CodeMirror);

import './code/polyfills';

import * as templates from './templates';

import { clickHandler } from './code/dom';
import { getConfig } from './code/config';
import { encodeProgram } from './code/util/encoder';

import { EventBus } from './code/event-bus';
import { Popups } from './code/ui/popups';
import { UI } from './code/ui';
import { Improviz } from './code/improviz';
import { IGfx } from './code/gfx';

function start() {
  const canvas = document.getElementById('canvas');

  const config = getConfig();
  const eventBus = new EventBus();
  const ui = new UI(eventBus);
  const popups = new Popups(document.querySelector('body'));
  eventBus.on('display-popup', popups.trigger.bind(popups));
  popups.register('error-popup', false, (message, error) => {
    return templates.errorPopup({
      message,
      error,
    });
  });

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    eventBus.emit(
      'display-popup',
      'error-popup',
      'Sorry, there was an error starting up',
      'Could not create WebGL context'
    );
    return;
  }

  const gfx = new IGfx(canvas, gl);

  const improviz = new Improviz(gfx, eventBus);
  const editor = CodeMirror(
    el => {
      document.querySelector('body').appendChild(el);
    },
    {
      keyMap: config.keyMap,
      lineNumbers: config.lineNumbers,
      theme: config.theme,
      value: config.program,
      mode: 'improviz',
      autofocus: true,
      gutters: ['CodeMirror-lint-markers'],
      lint: {
        getAnnotations: program => {
          const { errors } = improviz.parser.parse(program);
          let annotations;
          if (errors.length > 0) {
            annotations = errors;
          } else {
            annotations = improviz.runtimeErrors;
          }

          return annotations.map(err => ({
            from: CodeMirror.Pos(err.line - 1, err.character - 1),
            to: CodeMirror.Pos(err.line - 1, err.character - 1 + err.length),
            message: err.message,
            severity: 'error',
          }));
        },
      },
      extraKeys: {
        'Ctrl-Enter': () => improviz.evaluate(editor.getValue()),
      },
    }
  );

  popups.register('sharing', true, () => {
    const encodedProgram = encodeProgram(editor.getValue());
    const programSharingURL = URL.fromLocation();
    programSharingURL.searchParams.set('program', encodedProgram);
    // TODO maybe make the entire URL clear of params???
    programSharingURL.hash = '';
    return templates.sharingPopup({
      programSharingURL: programSharingURL.toString(),
    });
  });

  popups.register('settings', true, () => {
    const defaultKeymapURL = URL.fromLocation();
    defaultKeymapURL.searchParams.delete('keymap');
    const vimKeymapURL = URL.fromLocation();
    vimKeymapURL.searchParams.set('keymap', 'vim');

    const performanceDisabledURL = URL.fromLocation();
    performanceDisabledURL.searchParams.delete('performancemode');
    const performanceEnabledURL = URL.fromLocation();
    performanceEnabledURL.searchParams.set('performancemode', 'enabled');

    const lineNumbersDisabledURL = URL.fromLocation();
    lineNumbersDisabledURL.searchParams.delete('linenumbers');
    const lineNumbersEnabledURL = URL.fromLocation();
    lineNumbersEnabledURL.searchParams.set('linenumbers', 'enabled');

    return templates.settingsPopup({
      defaultKeymapURL: defaultKeymapURL.toString(),
      vimKeymapURL: vimKeymapURL.toString(),
      performanceEnabledURL: performanceEnabledURL.toString(),
      performanceDisabledURL: performanceDisabledURL.toString(),
      lineNumbersEnabledURL: lineNumbersEnabledURL.toString(),
      lineNumbersDisabledURL: lineNumbersDisabledURL.toString(),
    });
  });

  popups.register('help', true, () => {
    return templates.helpPopup();
  });

  clickHandler('#evaluate', () => eventBus.emit('evaluate'));
  clickHandler('#display-sharing', () =>
    eventBus.emit('display-popup', 'sharing')
  );
  clickHandler('#display-help', () => eventBus.emit('display-popup', 'help'));
  clickHandler('#display-settings', () =>
    eventBus.emit('display-popup', 'settings')
  );

  if (config.performanceMode) {
    ui.performanceMode();
  }

  const hash = URL.getHash();
  if (hash) {
    eventBus.emit('display-popup', hash);
  }

  eventBus.on('evaluate', () => improviz.evaluate(editor.getValue()));

  const improvizAnimate = improviz.genAnimateFunc(editor.getValue());
  const animate = time => {
    improvizAnimate(time);
    window.requestAnimationFrame(animate);
  };
  animate(0);
}
start();
