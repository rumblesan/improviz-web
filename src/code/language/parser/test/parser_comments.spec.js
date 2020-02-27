/* global describe, it, parserTest */

import { dedent } from 'dentist';

import Parser from '../index';
import { Application, Lambda, Program, Block, Num, Null } from '../../ast';

describe('Comments', function() {
  it(
    'ignores single comments',
    parserTest(new Parser(), '// this is a comment', Program([]))
  );

  it(
    'comments are ignored',
    parserTest(
      new Parser(),
      dedent(`

             // this is a comment


             // Parser should ignore


             box(4)
             `),
      Program([Application('box', [Num(4)])])
    )
  );

  it(
    'comments after commands are ignored',
    parserTest(
      new Parser(),
      dedent(`

             box(4) // this is a comment

             `),
      Program([Application('box', [Num(4)])])
    )
  );

  it(
    'comments in the middle of commands are ignored',
    parserTest(
      new Parser(),
      dedent(`

             box(4)
             // this is a comment
             peg(3)

             //and another

             `),
      Program([Application('box', [Num(4)]), Application('peg', [Num(3)])])
    )
  );

  it(
    'comments at the end of the program are ignored',
    parserTest(
      new Parser(),
      dedent(`

             box(4) // this is a comment

             `),
      Program([Application('box', [Num(4)])])
    )
  );

  it(
    'ignores indented comments',
    parserTest(
      new Parser(),
      dedent(`

             rotate()
             \t// this is a comment
             \tpeg(3)

             //and another

             `),
      Program([
        Application(
          'rotate',
          [],
          Lambda([], Null(), Block([Application('peg', [Num(3)])]))
        ),
      ])
    )
  );
});
