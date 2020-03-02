import { makeFunc, makeNum, isNum, isSymbol } from '../ffi';
import { InterpreterError } from '../interpreter/errors';
import { rotationXYZM44, moveXYZM44 } from '../../gfx/matrices';

export class StdLib {
  constructor(runtime) {
    this.runtime = runtime;
    this.scope = this.createScope();
  }

  createScope() {
    return {
      shape: makeFunc('shape', this.shape.bind(this)),
      rotate: makeFunc('rotate', this.rotate.bind(this)),
      move: makeFunc('move', this.move.bind(this)),
    };
  }

  setTime(value) {
    this.scope.time = makeNum(value);
  }

  shape(args) {
    let [name, x, y, z] = args;
    if (!isSymbol(name)) throw new InterpreterError('Expected Symbol', name);
    if (!isNum(x)) throw new InterpreterError('Expected Number', x);
    if (!isNum(y)) throw new InterpreterError('Expected Number', y);
    if (!isNum(z)) throw new InterpreterError('Expected Number', z);
    this.runtime.drawShape(name.value, [0.5, 0.7, 1]);
  }

  rotate(args) {
    let [x, y, z] = args;
    if (!isNum(x)) throw new InterpreterError('Expected Number', x);
    if (!isNum(y)) throw new InterpreterError('Expected Number', y);
    if (!isNum(z)) throw new InterpreterError('Expected Number', z);
    this.runtime.pushMatrix(rotationXYZM44(x.value, y.value, z.value));
  }

  move(args) {
    let [x, y, z] = args;
    if (!isNum(x)) throw new InterpreterError('Expected Number', x);
    if (!isNum(y)) throw new InterpreterError('Expected Number', y);
    if (!isNum(z)) throw new InterpreterError('Expected Number', z);
    this.runtime.pushMatrix(moveXYZM44(x.value, y.value, z.value));
  }
}
