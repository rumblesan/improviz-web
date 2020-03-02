import { makeFunc, makeNum, isNum, isSymbol } from '../ffi';
import { InterpreterError } from '../interpreter/errors';
import { rotationXYZM44, moveXYZM44, multiplyM44 } from '../../gfx/matrices';

import { fill } from './style';

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
      fill: makeFunc('move', fill.bind(this.runtime)),
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
    this.runtime.drawShape(name.value);
  }

  rotate(args) {
    let [x, y, z] = args;
    if (!isNum(x)) throw new InterpreterError('Expected Number', x);
    if (!isNum(y)) throw new InterpreterError('Expected Number', y);
    if (!isNum(z)) throw new InterpreterError('Expected Number', z);
    this.runtime.matrixStack.pushMod(
      rotationXYZM44(x.value, y.value, z.value),
      multiplyM44
    );
  }

  move(args) {
    let [x, y, z] = args;
    if (!isNum(x)) throw new InterpreterError('Expected Number', x);
    if (!isNum(y)) throw new InterpreterError('Expected Number', y);
    if (!isNum(z)) throw new InterpreterError('Expected Number', z);
    this.runtime.matrixStack.pushMod(
      moveXYZM44(x.value, y.value, z.value),
      multiplyM44
    );
  }
}
