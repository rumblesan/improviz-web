import { InterpreterError } from '../interpreter/errors';
import { isNum } from '../ffi';

export function fill(args) {
  let [r, g, b] = args;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  this.fillStack.push([r.value, g.value, b.value]);
}
