/* global describe, it */

import assert from 'assert';
import { dedent } from 'dentist';

import { Interpreter } from '../index';
import { Parser } from '../../parser';
import {
  Program,
  Application,
  Func,
  BinaryOp,
  Block,
  Num,
  Null,
  Lambda,
  Variable,
  VarArg,
  BlockArg,
} from '../../ast';

import { BUILTIN } from '../../ast/nodes';

describe('Interpreter', function() {
  it('evaluate simple expression', function() {
    const parser = new Parser();
    const interpreter = new Interpreter();
    let output;
    const scope = {
      result: {
        type: BUILTIN,
        func: function(args) {
          output = args[0].value;
        },
      },
    };
    const { ast } = parser.parse('result(3 + 4 * 2)', { testing: true });
    interpreter.run(ast, scope);

    assert.equal(output, 11, 'should return 11');
  });

  it('evaluate expression with variable', function() {
    const parser = new Parser();
    const interpreter = new Interpreter();
    let output;
    const scope = {
      result: {
        type: BUILTIN,
        func: function(args) {
          output = args[0].value;
        },
      },
      foo: Num(4),
    };
    const { ast } = parser.parse(
      dedent(`
             a = foo + 1
             result((a + 4) * foo)`),
      { testing: true }
    );
    interpreter.run(ast, scope);

    assert.equal(output, 36, 'output should be 36');
  });

  it('times loop', function() {
    const parser = new Parser();
    const interpreter = new Interpreter();
    let output;
    const scope = {
      result: {
        type: BUILTIN,
        func: function(args) {
          output = args[0].value;
        },
      },
    };

    const { ast } = parser.parse(
      dedent(`
             a = 0
             loop 5 times with i
               a = a + i
               result(a)
             `),
      { testing: true }
    );

    interpreter.run(ast, scope);

    assert.equal(output, 4, `output should be 4 not ${output}`);
  });

  it('function definition and usage', function() {
    const parser = new Parser();
    const interpreter = new Interpreter();
    let output;
    const scope = {
      result: {
        type: BUILTIN,
        func: function(args) {
          output = args[0].value;
        },
      },
    };

    const { ast } = parser.parse(
      dedent(`
             //the first function
             func a(x) => x * 2
             //another function
             func b(x, y) => x + y
             result(b(a(2), 3) +  a(1))
             `),
      { testing: true }
    );

    const expected = Program([
      Func('a', [VarArg('x')], Block([BinaryOp('*', Variable('x'), Num(2))])),
      Func(
        'b',
        [VarArg('x'), VarArg('y')],
        Block([BinaryOp('+', Variable('x'), Variable('y'))])
      ),
      Application('result', [
        BinaryOp(
          '+',
          Application('b', [Application('a', [Num(2)]), Num(3)]),
          Application('a', [Num(1)])
        ),
      ]),
    ]);

    assert.deepEqual(ast, expected);

    interpreter.run(ast, scope);

    assert.equal(output, 9, `output should be 9 not ${output}`);
  });

  it('function blocks are run correctly', function() {
    const parser = new Parser();
    const interpreter = new Interpreter();
    let output;
    const scope = {
      result: {
        type: BUILTIN,
        func: function(args) {
          output = args[0].value;
        },
      },
    };

    const { ast } = parser.parse(
      dedent(`
             func test(a, &blk)
               blk()

             test(1)
               result(3)
             `),
      { testing: true }
    );

    const expected = Program([
      Func(
        'test',
        [VarArg('a'), BlockArg('blk')],
        Block([Application('blk', [], Null())])
      ),
      Application(
        'test',
        [Num(1)],
        Lambda([], Null(), Block([Application('result', [Num(3)], Null())]))
      ),
    ]);

    assert.deepEqual(ast, expected);

    interpreter.run(ast, scope);

    assert.equal(output, 3, `output should be 3 not ${output}`);
  });
});
