import { BuiltIn, Num } from './ast';
import { NULL, NUM, SYMBOL } from './ast/nodes';

export function isNull(value) {
  return value && value.type === NULL;
}

export function isNum(value) {
  return value && value.type === NUM;
}

export function isSymbol(value) {
  return value && value.type === SYMBOL;
}

export function makeFunc(name, func) {
  return BuiltIn(name, func);
}

export function makeNum(value) {
  return Num(value);
}
