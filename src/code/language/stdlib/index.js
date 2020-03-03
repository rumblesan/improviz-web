import { makeFunc, makeNum } from '../ffi';

import { style } from './style';
import { shape } from './shapes';
import { matrix } from './transforms';
import { pushSnapshot, popSnapshot } from './system';

export class StdLib {
  constructor(runtime) {
    this.runtime = runtime;
    this.scope = this.createScope();
  }

  createScope() {
    return {
      shape: makeFunc('shape', shape.bind(this.runtime)),
      matrix: makeFunc('matrix', matrix.bind(this.runtime)),
      style: makeFunc('style', style.bind(this.runtime)),
      pushSnapshot: makeFunc('pushSnapshot', pushSnapshot.bind(this.runtime)),
      popSnapshot: makeFunc('popSnapshot', popSnapshot.bind(this.runtime)),
    };
  }

  setTime(value) {
    this.scope.time = makeNum(value);
  }
}
