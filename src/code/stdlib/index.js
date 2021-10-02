import { FFI } from '@improviz/language';
const { makeFunc, makeNum } = FFI;

import { style, strokeSize } from './style';
import { shape } from './shapes';
import { matrix } from './transforms';
import * as maths from './maths';
import {
  pushSnapshot,
  popSnapshot,
  background,
  depthOff,
  animationStyle,
} from './system';
import { isNull } from './util';

import { defaults } from './defaults.yaml';
import { styleFunctions } from './styles.yaml';
import { transformationFunctions } from './transformations.yaml';
import { shapeFunctions } from './shapes.yaml';

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
      sin: makeFunc('sin', maths.sin.bind(this.runtime)),
      cos: makeFunc('cos', maths.cos.bind(this.runtime)),
      tan: makeFunc('tan', maths.tan.bind(this.runtime)),
      abs: makeFunc('abs', maths.abs.bind(this.runtime)),
      ceil: makeFunc('ceil', maths.ceil.bind(this.runtime)),
      floor: makeFunc('floor', maths.floor.bind(this.runtime)),
      round: makeFunc('round', maths.round.bind(this.runtime)),
      max: makeFunc('max', maths.max.bind(this.runtime)),
      min: makeFunc('min', maths.min.bind(this.runtime)),
      log: makeFunc('log', maths.log.bind(this.runtime)),
      sqrt: makeFunc('sqrt', maths.sqrt.bind(this.runtime)),
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
