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
    case 'noFill':
      this.fillStack.push({ style: 'nofill' });
      break;
    case 'stroke':
      stroke.call(this, args);
      break;
    case 'noStroke':
      this.strokeStack.push({ style: 'nostroke' });
      break;
    case 'strokeSize':
      strokeSize.call(this, args);
      break;
    default:
      throw new InterpreterError('Unknown style command', s);
  }
}

export function fill(args) {
  let [r, g, b, a] = args;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  if (!isNum(a)) throw new InterpreterError('Expected Number', a);
  this.fillStack.push({
    style: 'fill',
    color: [r.value, g.value, b.value, a.value],
  });
}

export function stroke(args) {
  let [r, g, b, a] = args;
  if (!isNum(r)) throw new InterpreterError('Expected Number', r);
  if (!isNum(g)) throw new InterpreterError('Expected Number', g);
  if (!isNum(b)) throw new InterpreterError('Expected Number', b);
  if (!isNum(a)) throw new InterpreterError('Expected Number', a);
  this.strokeStack.push({
    style: 'stroke',
    color: [r.value, g.value, b.value, a.value],
  });
}

export function strokeSize(args) {
  let [s] = args;
  if (!isNum(s)) throw new InterpreterError('Expected Number', s);
  this.strokeSizeStack.push(s.value);
}
