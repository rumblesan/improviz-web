/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../index';
import {
  Program,
  Block,
  Assignment,
  Loop,
  Application,
  BinaryOp,
  Variable,
  Num,
  Null,
} from '../../ast';

describe('Parser', function() {
  it(
    'always parses an empty program',
    parserTest(new Parser(), '', Program([]))
  );

  it(
    'parses a simple patch',
    parserTest(
      new Parser(),
      dedent(`
        a = 3 + 4
        loop a times
          cube()
      `),
      Program([
        Assignment('a', BinaryOp('+', Num(3), Num(4))),
        Loop(Variable('a'), Block([Application('cube', [], Null())]), Null()),
      ])
    )
  );
});
