import { isNum, isSymbol } from '../ffi';
import { InterpreterError } from '../interpreter/errors';
import { multiplyM44, scaleXYZM44 } from '../../gfx/matrices';

export function shape(args) {
  let [name, x, y, z] = args;
  if (!isSymbol(name)) throw new InterpreterError('Expected Symbol', name);
  if (!isNum(x)) throw new InterpreterError('Expected Number', x);
  if (!isNum(y)) throw new InterpreterError('Expected Number', y);
  if (!isNum(z)) throw new InterpreterError('Expected Number', z);

  this.matrixStack.pushMod(scaleXYZM44(x.value, y.value, z.value), multiplyM44);
  this.drawShape(name.value);
  this.matrixStack.pop();
}
