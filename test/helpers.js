/* global global */

import assert from 'assert';

global.parserTest = function(parser, program, expectedAst) {
  return () => {
    var { ast, errors } = parser.parse(program);
    assert.deepEqual(errors, []);
    assert.deepEqual(ast, expectedAst);
  };
};
