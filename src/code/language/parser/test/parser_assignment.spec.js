/* global describe, it, parserTest */

import { dedent } from 'dentist';

import { Parser } from '../index';
import {
  Program,
  Assignment,
  ConditionalAssignment,
  BinaryOp,
  Num,
  UnaryOp,
  Variable,
} from '../../ast';

describe('Assignment', function() {
  it(
    'process function works',
    parserTest(
      new Parser(),
      'a = 3 + 5',
      Program([Assignment('a', BinaryOp('+', Num(3), Num(5)))])
    )
  );

  it(
    'assignment assigns numbers',
    parserTest(
      new Parser(),
      'number = 444',
      Program([Assignment('number', Num(444))])
    )
  );

  it(
    'assignment assigns negative numbers',
    parserTest(
      new Parser(),
      'number = -333',
      Program([Assignment('number', UnaryOp('-', Num(333)))])
    )
  );

  it(
    'multiple assignments assigns bigger expression',
    parserTest(
      new Parser(),
      dedent(`
        numa = 55 + 44 * 2 - 321
        numb = numa * -33
        numc = numa + numb
        `),
      Program([
        Assignment(
          'numa',
          BinaryOp(
            '+',
            Num(55),
            BinaryOp('-', BinaryOp('*', Num(44), Num(2)), Num(321))
          )
        ),
        Assignment(
          'numb',
          BinaryOp('*', Variable('numa'), UnaryOp('-', Num(33)))
        ),
        Assignment('numc', BinaryOp('+', Variable('numa'), Variable('numb'))),
      ])
    )
  );

  it(
    'brackets work correctly in expressions',
    parserTest(
      new Parser(),
      '\nnumber = (456 + 33) * 2\n',
      Program([
        Assignment(
          'number',
          BinaryOp('*', BinaryOp('+', Num(456), Num(33)), Num(2))
        ),
      ])
    )
  );

  it(
    'parses conditional assignments correctly',
    parserTest(
      new Parser(),
      '\n\na := 12\n\n',
      Program([ConditionalAssignment('a', Num(12))])
    )
  );
});
