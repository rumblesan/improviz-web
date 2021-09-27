import { InterpreterError } from '../interpreter/errors';
import { isNum, isSymbol } from '../ffi';

export function pushSnapshot() {
  this.pushSnapshot();
}

export function popSnapshot() {
  this.popSnapshot();
}

export function background(args) {
  let r = args[0] || 0;
  let g = args[1] || r;
  let b = args[2] || g;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  this.background.set([r.value, g.value, b.value]);
}

export function depthOff() {
  this.depthCheck.set(false);
}

export function animationStyle(args) {
  let [animationStyle] = args;
  if (!isSymbol(animationStyle))
    throw new InterpreterError('Expected Symbol', animationStyle);
  this.renderMode.set(animationStyle.value);
}
