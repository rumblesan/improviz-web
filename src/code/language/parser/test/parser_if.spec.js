/* global describe, it, parserTest */

import { dedent } from 'dentist';

import Parser from '../index';
import {
  Program,
  Block,
  Assignment,
  Application,
  BinaryOp,
  Variable,
  If,
  Num,
  Lambda,
  Null,
  Symbol,
} from '../../ast';

describe('If', function() {
  it(
    'simple if statement parses',
    parserTest(
      new Parser(),
      dedent(`
        a = 3

        if (a == 3)
          box()
      `),
      Program([
        Assignment('a', Num(3)),
        If([
          [
            BinaryOp('==', Variable('a'), Num(3)),
            Block([Application('box', [])]),
          ],
        ]),
      ])
    )
  );

  it(
    'simple inline if statement parses',
    parserTest(
      new Parser(),
      dedent(`
             a = 3

             if (a == 3)
               box()

             `),
      Program([
        Assignment('a', Num(3)),
        If([
          [
            BinaryOp('==', Variable('a'), Num(3)),
            Block([Application('box', [])]),
          ],
        ]),
      ])
    )
  );

  it(
    'if else statement parses',
    parserTest(
      new Parser(),
      dedent(`
             a = 3
             if a == 3
               box()
             else
               peg()
             `),
      Program([
        Assignment('a', Num(3)),
        If([
          [
            BinaryOp('==', Variable('a'), Num(3)),
            Block([Application('box', [])]),
          ],
          [Num(1), Block([Application('peg', [])])],
        ]),
      ])
    )
  );

  it(
    'inline if else statement parses',
    parserTest(
      new Parser(),
      dedent(`
             a = 3
             if a == 3
               box()
             else
               peg(1)
             box()
             `),
      Program([
        Assignment('a', Num(3)),
        If([
          [
            BinaryOp('==', Variable('a'), Num(3)),
            Block([Application('box', [])]),
          ],
          [Num(1), Block([Application('peg', [Num(1)])])],
        ]),
        Application('box', []),
      ])
    )
  );

  it(
    'if elseif else statement parses',
    parserTest(
      new Parser({ debug: true }),
      dedent(`
             a = 3
             if a == 1
               box()
             else if a == 2
               ball()
             else
               peg()
             `),
      Program([
        Assignment('a', Num(3)),
        If([
          [
            BinaryOp('==', Variable('a'), Num(1)),
            Block([Application('box', [])]),
          ],
          [
            BinaryOp('==', Variable('a'), Num(2)),
            Block([Application('ball', [])]),
          ],
          [Num(1), Block([Application('peg', [])])],
        ]),
      ])
    )
  );

  it(
    'if else statement parses inside a block',
    parserTest(
      new Parser(),
      dedent(`
             rotate()
               if 1
                 box()
               else
                 peg()`),
      Program([
        Application(
          'rotate',
          [],
          Lambda(
            [],
            Null(),
            Block([
              If([
                [Num(1), Block([Application('box', [])])],
                [Num(1), Block([Application('peg', [])])],
              ]),
            ])
          )
        ),
      ])
    )
  );

  it(
    'if with time and modulo',
    parserTest(
      new Parser(),
      dedent(`
             if time % 10 < 5
               animationStyle(:paintOver)
             rotate()
               box()`),
      Program([
        If([
          [
            BinaryOp('<', BinaryOp('%', Variable('time'), Num(10)), Num(5)),
            Block([Application('animationStyle', [Symbol('paintOver')])]),
          ],
        ]),
        Application(
          'rotate',
          [],
          Lambda([], Null(), Block([Application('box', [])]))
        ),
      ])
    )
  );
});
