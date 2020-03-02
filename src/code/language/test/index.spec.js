/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../parser';
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
} from '../ast';

describe('Language', function() {
  it(
    'parses a simple program',
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
