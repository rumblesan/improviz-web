import { FFI } from '@improviz/language';
const { makeNum, isNull: isNullFFI } = FFI;

export function isNull(args) {
  return makeNum(isNullFFI(args[0]) ? 1 : 0);
}
