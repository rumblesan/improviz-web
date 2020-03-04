import { makeNum, isNull as isNullFFI } from '../ffi';

export function isNull(args) {
  return makeNum(isNullFFI(args[0]) ? 1 : 0);
}
