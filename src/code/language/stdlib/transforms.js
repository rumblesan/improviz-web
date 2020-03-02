import { InterpreterError } from '../interpreter/errors';
import { isNum, isSymbol } from '../ffi';

import {
  scaleXYZM44,
  rotationXYZM44,
  moveXYZM44,
  multiplyM44,
} from '../../gfx/matrices';

export function matrix(args) {
  const s = args.shift();
  if (!isSymbol(s))
    throw new InterpreterError(`Expected Symbol but found ${s.type}`, s);
  switch (s.value) {
    case 'rotate':
      rotate.call(this, args);
      break;
    case 'move':
      move.call(this, args);
      break;
    case 'scale':
      scale.call(this, args);
      break;
    default:
      throw new InterpreterError('Unknown style command', s);
  }
}

export function rotate(args) {
  let [x, y, z] = args;
  if (!isNum(x)) throw new InterpreterError('Expected Number', x);
  if (!isNum(y)) throw new InterpreterError('Expected Number', y);
  if (!isNum(z)) throw new InterpreterError('Expected Number', z);
  this.matrixStack.pushMod(
    rotationXYZM44(x.value, y.value, z.value),
    multiplyM44
  );
}

export function move(args) {
  let [x, y, z] = args;
  if (!isNum(x)) throw new InterpreterError('Expected Number', x);
  if (!isNum(y)) throw new InterpreterError('Expected Number', y);
  if (!isNum(z)) throw new InterpreterError('Expected Number', z);
  this.matrixStack.pushMod(moveXYZM44(x.value, y.value, z.value), multiplyM44);
}

export function scale(args) {
  let [x, y, z] = args;
  if (!isNum(x)) throw new InterpreterError('Expected Number', x);
  if (!isNum(y)) throw new InterpreterError('Expected Number', y);
  if (!isNum(z)) throw new InterpreterError('Expected Number', z);
  this.matrixStack.pushMod(scaleXYZM44(x.value, y.value, z.value), multiplyM44);
}
