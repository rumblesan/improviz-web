import { Parser, Interpreter, StdLib } from './language';
import { Program } from './language/ast';

export class Improviz {
  constructor(eventBus, gfx) {
    this.eventBus = eventBus;
    this.gfx = gfx;
    this.parser = new Parser();
    this.interpreter = new Interpreter();
    this.stdlib = new StdLib(gfx, this.parser, this.interpreter);
    this.lastWorkingProgram = Program([]);
    this.workingCount = 0;
    this.currentProgram = Program([]);
    this.runtimeErrors = [];
  }

  resetToLastWorkingProgram() {
    this.currentProgram = this.lastWorkingProgram;
    this.workingCount = 0;
  }

  evaluate(program) {
    try {
      this.runtimeErrors = [];
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

  start(program) {
    this.gfx.init();
    this.evaluate(program);

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
      }
      window.requestAnimationFrame(animate);
    };
    animate(0);
  }
}
