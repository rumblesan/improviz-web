import { BuiltIn, Num } from './ast';
import { NUM, SYMBOL } from './ast/nodes';

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
