import './index.html';
import './favicon.ico';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import './styles/web-main.scss';

import CodeMirror from 'codemirror';
import 'codemirror/keymap/vim';
import 'codemirror/addon/lint/lint.js';
import defineImprovizMode from './code/editor/improviz-mode';
defineImprovizMode(CodeMirror);

import './code/polyfills';

import { clickHandler } from './code/dom';
import { Settings } from './code/settings';
import { DataCache } from './code/DataCache';

import { EventBus } from './code/event-bus';
import { Popups } from './code/ui/popups';
import { settingsMarkup, settingsEventHandlers } from './code/ui/popups/settings';
import { sharingMarkup } from './code/ui/popups/sharing';
import { helpMarkup } from './code/ui/popups/help';
import { errorMarkup } from './code/ui/popups/error';
import { texturesMarkup, texturesEventHandlers } from './code/ui/popups/textures';
import { UI } from './code/ui';
import { Improviz } from './code/improviz';
import { IGfx } from './code/gfx';
import { builtInTextures } from './textures';

function start() {
  const canvas = document.getElementById('canvas');
  const eventBus = new EventBus();

  const dataCache = new DataCache();
  const settings = new Settings(eventBus);
  settings.load(URL.fromLocation().searchParams);
  new UI(eventBus, settings);
  const popups = new Popups(document.querySelector('body'));
  eventBus.on('display-popup', popups.trigger.bind(popups));
  popups.register('error-popup', false, errorMarkup());

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
  const cachedTextures = dataCache.load('textures');
  const texturesToLoad = cachedTextures ? cachedTextures : builtInTextures;
  Promise.all(
    texturesToLoad.map(t => gfx.loadTexture(t))
  ).then(() => {
    const allTextures = gfx.getAllTextures();
    if (!allTextures.algorave) gfx.loadTexture(builtInTextures.algorave);
    if (!allTextures.crystal) gfx.loadTexture(builtInTextures.crystal);
  });

  const improviz = new Improviz(gfx, eventBus);
  const editor = CodeMirror(
    el => {
      document.querySelector('body').appendChild(el);
    },
    {
      keyMap: settings.get('keyMap'),
      lineNumbers: settings.get('lineNumbers'),
      theme: settings.get('theme'),
      value: settings.get('program'),
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

  popups.register('sharing', true, sharingMarkup(editor));
  popups.register('help', true, helpMarkup());
  popups.register('textures', true, texturesMarkup(gfx), texturesEventHandlers(eventBus));
  popups.register('settings', true, settingsMarkup(settings), settingsEventHandlers(settings));

  clickHandler('#evaluate', () => eventBus.emit('evaluate'));
  clickHandler('#display-sharing', () =>
    eventBus.emit('display-popup', 'sharing')
  );
  clickHandler('#display-help', () =>
    eventBus.emit('display-popup', 'help')
  );
  clickHandler('#display-textures', () =>
    eventBus.emit('display-popup', 'textures')
  );
  clickHandler('#display-settings', () =>
    eventBus.emit('display-popup', 'settings', settings)
  );

  const hash = URL.getHash();
  if (hash) {
    eventBus.emit('display-popup', hash);
  }

  eventBus.on('evaluate', () => improviz.evaluate(editor.getValue()));

  eventBus.on('saving-program', (workingCode) => {
    settings.set('program', workingCode);
  });

  eventBus.on('load-texture', texture => {
    gfx.loadTexture(texture).then( () => {
      const allTextures = gfx.getAllTextures();
      const textures = Object
        .keys(allTextures)
        .map(name => ({
          name,
          url: allTextures[name].image.src,
        }));
      dataCache.save('textures', textures);
    });
  });
  eventBus.on('unload-texture', (name) => {
    gfx.unloadTexture(name);
    const allTextures = gfx.getAllTextures();
    const textures = Object
      .keys(allTextures)
      .map(name => ({
        name,
        url: allTextures[name].image.src,
      }));
    dataCache.save('textures', textures);
  });

  const improvizAnimate = improviz.genAnimateFunc(editor.getValue());
  const animate = time => {
    improvizAnimate(time);
    window.requestAnimationFrame(animate);
  };
  animate(0);
}
start();
