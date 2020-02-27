/* global describe, it, parserTest */

import { dedent } from 'dentist';

import Parser from '../index';
import {
  Program,
  Application,
  Assignment,
  BinaryOp,
  Block,
  Func,
  VarArg,
  If,
  Num,
  Variable,
} from '../../ast';

describe('Function', function() {
  it(
    'simple function call parses',
    parserTest(new Parser(), 'box(1)', Program([Application('box', [Num(1)])]))
  );

  it(
    'block function is ast',
    parserTest(
      new Parser(),
      dedent(`
             func bar(a, b)
               c = a + b
               box(c, 3)
             `),
      Program([
        Func(
          'bar',
          [VarArg('a'), VarArg('b')],
          Block([
            Assignment('c', BinaryOp('+', Variable('a'), Variable('b'))),
            Application('box', [Variable('c'), Num(3)]),
          ])
        ),
      ])
    )
  );

  it(
    'block function with if is ast',
    parserTest(
      new Parser(),
      dedent(`
             func bar(a, b)
               if a > b
                 box(a)
               else
                 box(b)
             `),
      Program([
        Func(
          'bar',
          [VarArg('a'), VarArg('b')],
          Block([
            If([
              [
                BinaryOp('>', Variable('a'), Variable('b')),
                Block([Application('box', [Variable('a')])]),
              ],
              [Num(1), Block([Application('box', [Variable('b')])])],
            ]),
          ])
        ),
      ])
    )
  );

  it(
    'expression function is ast then used',
    parserTest(
      new Parser(),
      dedent(`
             func foo(a) => a + 3
             bar = foo(1 + foo(2))
             `),
      Program([
        Func(
          'foo',
          [VarArg('a')],
          Block([BinaryOp('+', Variable('a'), Num(3))])
        ),
        Assignment(
          'bar',
          Application('foo', [
            BinaryOp('+', Num(1), Application('foo', [Num(2)])),
          ])
        ),
      ])
    )
  );

  it(
    'complex expression function is ast',
    parserTest(
      new Parser(),
      'func foo(x, y, j, z) => spread * (  ( noise(x * abs(sin(time+y) * movmentSpeed)) / (j + z) ) - 0.5  )',
      Program([
        Func(
          'foo',
          [VarArg('x'), VarArg('y'), VarArg('j'), VarArg('z')],
          Block([
            BinaryOp(
              '*',
              Variable('spread'),
              BinaryOp(
                '-',
                BinaryOp(
                  '/',
                  Application('noise', [
                    BinaryOp(
                      '*',
                      Variable('x'),
                      Application('abs', [
                        BinaryOp(
                          '*',
                          Application('sin', [
                            BinaryOp('+', Variable('time'), Variable('y')),
                          ]),
                          Variable('movmentSpeed')
                        ),
                      ])
                    ),
                  ]),
                  BinaryOp('+', Variable('j'), Variable('z'))
                ),
                Num(0.5)
              )
            ),
          ])
        ),
      ])
    )
  );
});
