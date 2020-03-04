import { Parser, Interpreter, StdLib } from './language';

export class Improviz {
  constructor(config, eventBus, CodeMirror, gfx) {
    this.eventBus = eventBus;
    this.gfx = gfx;
    this.parser = new Parser();
    this.stdlib = new StdLib(gfx);
    this.interpreter = new Interpreter(this.stdlib);
    this.currentProgram = null;

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

            return errors.map(err => ({
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
    this.evaluate();

    this.eventBus.on('evaluate', () => this.evaluate());
  }

  getProgram() {
    return this.editor.getValue();
  }

  evaluate() {
    try {
      const program = this.editor.getValue();
      const result = this.parser.parse(program);
      console.log(result);
      if (result.errors.length < 1) {
        this.eventBus.emit('clear-error');
        this.currentProgram = result.ast;
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
    const animate = time => {
      this.gfx.reset();
      this.stdlib.setTime(time);
      this.interpreter.run(this.currentProgram, this.stdlib.scope);
      window.requestAnimationFrame(animate);
    };
    animate(0);
  }
}
