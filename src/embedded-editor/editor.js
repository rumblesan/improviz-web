import './index.html';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import '../styles/embed-main.scss';

import CodeMirror from 'codemirror';
import 'codemirror/keymap/vim';
import 'codemirror/addon/lint/lint.js';
import defineImprovizMode from '../code/editor/improviz-mode';
defineImprovizMode(CodeMirror);

import '../code/polyfills';

import { Parser } from '@improviz/language';

import * as templates from '../templates';

import { clickHandler } from '../code/dom';
import { Configuration } from '../code/config';
import { encodeProgram } from '../code/util/encoder';

import { EventBus } from '../code/event-bus';
import { Popups } from '../code/ui/popups';
import { UI } from '../code/ui';
import { LocalStorage } from '../code/LocalStorage';


import ImprovizComs from './ImprovizComs';

function start() {

  const params = URL.fromLocation().searchParams;
  const cache = new LocalStorage();
  const config = new Configuration(cache, params);
  const eventBus = new EventBus();
  new UI(eventBus);
  const parser = new Parser();
  const coms = new ImprovizComs(window.fetch);
  const popups = new Popups(document.querySelector('body'));
  eventBus.on('display-popup', popups.trigger.bind(popups));
  popups.register('error-popup', false, (message, error) => {
    return templates.errorPopup({
      message,
      error,
    });
  });

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
          const { errors } = parser.parse(program);
          let annotations = [];
          if (errors.length > 0) {
            annotations = errors;
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
        'Ctrl-Enter': () => eventBus.emit('evaluate')
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
  clickHandler('#display-settings', () =>
    eventBus.emit('display-popup', 'settings')
  );

  const hash = URL.getHash();
  if (hash) {
    eventBus.emit('display-popup', hash);
  }

  eventBus.on('evaluate', () => {
    const code = editor.getValue();
    coms.sendCode(code)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'error') {
          console.log(data.payload);
        } else if (data.status === 'ok') {
          cache.saveCode(code);
        }
      });
  });

}
start();
