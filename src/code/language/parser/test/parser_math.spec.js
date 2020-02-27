/* global describe, it, parserTest */

import { dedent } from 'dentist';

import Parser from '../index';
import {
  Program,
  Assignment,
  BinaryOp,
  Num,
  UnaryOp,
  Variable,
} from '../../ast';

describe('Math', function() {
  it(
    'negative number',
    parserTest(
      new Parser(),
      'a = -3',
      Program([Assignment('a', UnaryOp('-', Num(3)))])
    )
  );

  it(
    'negative variable',
    parserTest(
      new Parser(),
      dedent(`
             a = 3
             b = -a
             `),
      Program([
        Assignment('a', Num(3)),
        Assignment('b', UnaryOp('-', Variable('a'))),
      ])
    )
  );

  it(
    'negative expression',
    parserTest(
      new Parser(),
      'a = -(3 + 4)',
      Program([Assignment('a', UnaryOp('-', BinaryOp('+', Num(3), Num(4))))])
    )
  );

  it(
    'parenthesised expressions',
    parserTest(
      new Parser(),
      'a = (3 + 4) + 4',
      Program([
        Assignment('a', BinaryOp('+', BinaryOp('+', Num(3), Num(4)), Num(4))),
      ])
    )
  );
});
