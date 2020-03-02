import { BUILTIN, NUM, SYMBOL } from './ast/nodes';

export function isNum(value) {
  return value && value.type === NUM;
}

export function isSymbol(value) {
  return value && value.type === SYMBOL;
}

export function makeFunc(func) {
  return {
    type: BUILTIN,
    func,
  };
}
