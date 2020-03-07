import { makeFunc, makeNum } from '../ffi';

import { style, strokeSize } from './style';
import { shape } from './shapes';
import { matrix } from './transforms';
import {
  pushSnapshot,
  popSnapshot,
  background,
  depthOff,
  animationStyle,
} from './system';
import { isNull } from './util';

import { defaults } from '../../stdlib/defaults.yaml';
import { styleFunctions } from '../../stdlib/styles.yaml';
import { transformationFunctions } from '../../stdlib/transformations.yaml';
import { shapeFunctions } from '../../stdlib/shapes.yaml';

export class StdLib {
  constructor(runtime, parser, interpreter) {
    this.runtime = runtime;
    this.interpreter = interpreter;
    this.parser = parser;
    this.scope = this.createScope();
  }

  createScope() {
    const newScope = {
      shape: makeFunc('shape', shape.bind(this.runtime)),
      matrix: makeFunc('matrix', matrix.bind(this.runtime)),
      style: makeFunc('style', style.bind(this.runtime)),
      strokeSize: makeFunc('strokeSize', strokeSize.bind(this.runtime)),
      pushSnapshot: makeFunc('pushSnapshot', pushSnapshot.bind(this.runtime)),
      popSnapshot: makeFunc('popSnapshot', popSnapshot.bind(this.runtime)),
      background: makeFunc('background', background.bind(this.runtime)),
      depthOff: makeFunc('depthOff', depthOff.bind(this.runtime)),
      isNull: makeFunc('isNull', isNull.bind(this.runtime)),
      animationStyle: makeFunc(
        'animationStyle',
        animationStyle.bind(this.runtime)
      ),
    };

    this.loadExternals(defaults, newScope);
    this.loadExternals(styleFunctions, newScope);
    this.loadExternals(transformationFunctions, newScope);
    this.loadExternals(shapeFunctions, newScope);

    return newScope;
  }

  loadExternals(externals, scope) {
    externals.forEach(f => {
      const parseResult = this.parser.parse(f.code);
      if (parseResult.errors.length > 0) {
        // FIXME need a better way to report errors in loading here
        throw parseResult.errors;
      }
      const interpResult = this.interpreter.run(parseResult.ast, scope, true);
      if (interpResult.exitCode !== 0) {
        throw interpResult.errors;
      }
    });
    return scope;
  }

  setTime(value) {
    this.scope.time = makeNum(value);
  }
}
