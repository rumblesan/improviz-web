import { InterpreterError } from '../interpreter/errors';
import { isNum } from '../ffi';

export function pushSnapshot() {
  this.pushSnapshot();
}

export function popSnapshot() {
  this.popSnapshot();
}

export function background(args) {
  let [r, g, b] = args;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  this.background.set([r.value, g.value, b.value]);
}

export function depthOff() {
  this.depthCheck.set(false);
}
