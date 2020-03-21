import { Parser, Interpreter, StdLib } from './language';
import { Program } from './language/ast';

export class Improviz {
  constructor(config, eventBus, CodeMirror, gfx) {
    this.eventBus = eventBus;
    this.gfx = gfx;
    this.parser = new Parser();
    this.interpreter = new Interpreter();
    this.stdlib = new StdLib(gfx, this.parser, this.interpreter);
    this.lastWorkingProgram = Program([]);
    this.workingCount = 0;
    this.currentProgram = Program([]);
    this.runtimeErrors = [];

    this.editor = CodeMirror(
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
            const { errors } = this.parser.parse(program);
            let annotations;
            if (errors.length > 0) {
              annotations = errors;
            } else {
              annotations = this.runtimeErrors;
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
          'Ctrl-Enter': () => this.evaluate(),
        },
      }
    );
  }

  getProgram() {
    return this.editor.getValue();
  }

  resetToLastWorkingProgram() {
    this.currentProgram = this.lastWorkingProgram;
    this.workingCount = 0;
  }

  evaluate() {
    try {
      this.runtimeErrors = [];
      const program = this.editor.getValue();
      const result = this.parser.parse(program);
      if (result.errors.length < 1) {
        this.eventBus.emit('clear-error');
        this.currentProgram = result.ast;
        this.workingCount = 0;
      } else {
        const errCount = result.errors.length;
        const msg = errCount === 1 ? '1 Error!' : `${errCount} Errors!`;
        this.eventBus.emit('display-error', new Error(msg));
      }
    } catch (err) {
      this.eventBus.emit('display-error', err);
    }
  }

  start() {
    this.gfx.init();
    this.evaluate();

    this.eventBus.on('evaluate', () => this.evaluate());

    const animate = time => {
      this.gfx.begin();
      this.stdlib.setTime(time);
      const result = this.interpreter.run(
        this.currentProgram,
        this.stdlib.scope
      );
      this.gfx.end();
      if (result.exitCode === 0) {
        this.workingCount += 1;
        if (this.workingCount === 10) {
          this.lastWorkingProgram = this.currentProgram;
        }
      } else {
        this.workingCount = 0;
        this.currentProgram = this.lastWorkingProgram;
        this.runtimeErrors = result.errors;
        console.log(result.errors);
        this.editor.performLint();
      }
      window.requestAnimationFrame(animate);
    };
    animate(0);
  }
}
