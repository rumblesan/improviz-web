import { makeFunc, makeNum } from '../ffi';

import { style } from './style';
import { shape } from './shapes';
import { rotate, move, scale } from './transforms';

export class StdLib {
  constructor(runtime) {
    this.runtime = runtime;
    this.scope = this.createScope();
  }

  createScope() {
    return {
      shape: makeFunc('shape', shape.bind(this.runtime)),
      rotate: makeFunc('rotate', rotate.bind(this.runtime)),
      move: makeFunc('move', move.bind(this.runtime)),
      scale: makeFunc('scale', scale.bind(this.runtime)),
      style: makeFunc('style', style.bind(this.runtime)),
    };
  }

  setTime(value) {
    this.scope.time = makeNum(value);
  }
}
