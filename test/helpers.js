/* global global */

import assert from 'assert';

global.parserTest = function(parser, program, expectedAst) {
  return () => {
    var { ast, errors } = parser.parse(program, { testing: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(ast, expectedAst);
  };
};
