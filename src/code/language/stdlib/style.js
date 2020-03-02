import { InterpreterError } from '../interpreter/errors';
import { isNum, isSymbol } from '../ffi';

export function style(args) {
  const s = args.shift();
  if (!isSymbol(s))
    throw new InterpreterError(`Expected Symbol but found ${s.type}`, s);
  switch (s.value) {
    case 'fill':
      fill.call(this, args);
      break;
    default:
      throw new InterpreterError('Unknown style command', s);
  }
}

export function fill(args) {
  let [r, g, b] = args;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  this.fillStack.push([r.value, g.value, b.value]);
}
