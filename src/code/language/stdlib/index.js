import { makeFunc, makeNum } from '../ffi';

import { style, strokeSize } from './style';
import { shape } from './shapes';
import { matrix } from './transforms';
import { pushSnapshot, popSnapshot, background, depthOff } from './system';

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
      strokeSize: makeFunc('strokeSize', strokeSize.bind(this.runtime)),
      pushSnapshot: makeFunc('pushSnapshot', pushSnapshot.bind(this.runtime)),
      popSnapshot: makeFunc('popSnapshot', popSnapshot.bind(this.runtime)),
      background: makeFunc('background', background.bind(this.runtime)),
      depthOff: makeFunc('depthOff', depthOff.bind(this.runtime)),
    };
  }

  setTime(value) {
    this.scope.time = makeNum(value);
  }
}
