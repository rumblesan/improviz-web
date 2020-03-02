/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../index';
import { Program, Assignment, Index, List, Num, Variable } from '../../ast';

describe('List', function() {
  it(
    'basic list literal works',
    parserTest(
      new Parser(),
      dedent(`
        a = [1, 3, 5]
        `),
      Program([Assignment('a', List([Num(1), Num(3), Num(5)]))])
    )
  );

  it(
    'can deindex a value from a list',
    parserTest(
      new Parser(),
      dedent(`
        a = [1, 3, 5]
        b = a[0]
        `),
      Program([
        Assignment('a', List([Num(1), Num(3), Num(5)])),
        Assignment('b', Index(Variable('a'), Num(0))),
      ])
    )
  );
});
