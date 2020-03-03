/* global global, expect */

global.parserTest = function(parser, program, expectedAst) {
  return () => {
    var { ast, errors } = parser.parse(program, { testing: true });
    expect(errors).toEqual([]);
    expect(ast).toEqual(expectedAst);
  };
};

global.parserErrorTest = function(parser, program, expectedErrors) {
  return () => {
    var { errors } = parser.parse(program, { testing: true });
    errors.forEach((e, idx) => {
      expect(e).toBeInstanceOf(expectedErrors[idx]);
    });
  };
};
