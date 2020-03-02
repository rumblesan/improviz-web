/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../index';
import {
  Program,
  Application,
  Assignment,
  Block,
  Num,
  Loop,
  Variable,
} from '../../ast';

describe('Loop', function() {
  it(
    'basic times loop works',
    parserTest(
      new Parser(),
      dedent(`
        loop 4 times
        \tbox(4)
        `),
      Program([Loop(Num(4), Block([Application('box', [Num(4)])]))])
    )
  );

  it(
    'times loop with variable',
    parserTest(
      new Parser(),
      dedent(`
        loop 4 times with i
        \tbox(4)
        `),
      Program([
        Loop(Num(4), Block([Application('box', [Num(4)])]), Variable('i')),
      ])
    )
  );

  it(
    'times loop with variable number and loopvar',
    parserTest(
      new Parser(),
      dedent(`
        foo = 100
        loop foo times with i
        \tbox(4)
        `),
      Program([
        Assignment('foo', Num(100)),
        Loop(
          Variable('foo'),
          Block([Application('box', [Num(4)])]),
          Variable('i')
        ),
      ])
    )
  );
});
