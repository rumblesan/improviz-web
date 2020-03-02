/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../index';
import {
  Program,
  Application,
  Lambda,
  Block,
  Loop,
  Num,
  Variable,
  Null,
  VarArg,
  BlockArg,
} from '../../ast';

describe('Block', function() {
  it(
    'nested blocks parses',
    parserTest(
      new Parser(),
      dedent(`
        loop 4 times
          rotate()
            box(4)
        ball(2)
        `),
      Program([
        Loop(
          Num(4),
          Block([
            Application(
              'rotate',
              [],
              Lambda([], Null(), Block([Application('box', [Num(4)])]))
            ),
          ]),
          Null()
        ),
        Application('ball', [Num(2)]),
      ])
    )
  );

  it(
    'block lambdas with args parse',
    parserTest(
      new Parser(),
      dedent(`
        rotate()
          |x, &y|
          box(x)
          y()
        `),
      Program([
        Application(
          'rotate',
          [],
          Lambda(
            [VarArg('x'), BlockArg('y')],
            Null(),
            Block([Application('box', [Variable('x')]), Application('y', [])])
          )
        ),
      ])
    )
  );
});
