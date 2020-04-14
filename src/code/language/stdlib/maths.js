import { makeNum } from '../ffi';
import { InterpreterError } from '../interpreter/errors';
import { isNum } from '../ffi';

const TORAD = Math.PI / 180;

export function sin(args) {
  const angle = args[0];
  if (!isNum(angle))
    throw new InterpreterError(
      `Expected Number but found ${angle.type}`,
      angle
    );
  return makeNum(Math.sin(angle.value * TORAD));
}

export function cos(args) {
  const angle = args[0];
  if (!isNum(angle))
    throw new InterpreterError(
      `Expected Number but found ${angle.type}`,
      angle
    );
  return makeNum(Math.cos(angle.value * TORAD));
}

export function tan(args) {
  const angle = args[0];
  if (!isNum(angle))
    throw new InterpreterError(
      `Expected Number but found ${angle.type}`,
      angle
    );
  return makeNum(Math.tan(angle.value * TORAD));
}

export function abs(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.abs(val.value));
}

export function ceil(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.ceil(val.value));
}

export function floor(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.floor(val.value));
}

export function round(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.round(val.value));
}

export function log(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.log(val.value));
}

export function sqrt(args) {
  const val = args[0];
  if (!isNum(val))
    throw new InterpreterError(`Expected Number but found ${val.type}`, val);
  return makeNum(Math.sqrt(val.value));
}

export function max(args) {
  const [v1, v2] = args;
  if (!isNum(v1))
    throw new InterpreterError(`Expected Number but found ${v1.type}`, v1);
  if (!isNum(v2))
    throw new InterpreterError(`Expected Number but found ${v2.type}`, v2);
  return v1.value > v2.value ? v1 : v2;
}

export function min(args) {
  const [v1, v2] = args;
  if (!isNum(v1))
    throw new InterpreterError(`Expected Number but found ${v1.type}`, v1);
  if (!isNum(v2))
    throw new InterpreterError(`Expected Number but found ${v2.type}`, v2);
  return v1.value < v2.value ? v1 : v2;
}
