import { Lexer, StandardTokenTypes } from '@rumblesan/virgil';

const whiteSpace = StandardTokenTypes.whitespace();

const comment = {
  name: 'comment',
  ignore: true,
  regexp: /^\/\/[^\n]*/,
};

const newline = {
  name: 'newline',
  regexp: /^\n+/,
};

const comma = StandardTokenTypes.constant(',', 'comma');

const colon = StandardTokenTypes.constant(':', 'colon');

const lambdaArrow = StandardTokenTypes.constant('=>', 'lambda arrow');

const assignment = StandardTokenTypes.constant('=', 'assignment');

const blockArgSymbol = StandardTokenTypes.constant('&', '&');

const openParen = StandardTokenTypes.constant('(', 'open paren');

const closeParen = StandardTokenTypes.constant(')', 'close paren');

const openBracket = StandardTokenTypes.constant('[', 'open bracket');

const closeBracket = StandardTokenTypes.constant(']', 'close bracket');

const pipe = StandardTokenTypes.constant('|', 'pipe');

export const keywords = [
  'if',
  'elif',
  'else',
  'null',
  'loop',
  'times',
  'with',
  'func',
];

const operator = {
  name: 'operator',
  regexp: /^(==|>=|<=|<|>|&&|\|\||\+|-|\*|\/|%)/,
};

const number = {
  name: 'number',
  regexp: /^\d+(\.\d+)?/,
  interpret(content) {
    return parseFloat(content);
  },
};

const identifier = {
  name: 'identifier',
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
};

export const tokenIdentifiers = {
  whiteSpace,
  newline,
  comment,
  comma,
  colon,
  lambdaArrow,
  assignment,
  blockArgSymbol,
  openParen,
  closeParen,
  openBracket,
  closeBracket,
  operator,
  number,
  identifier,
};

export function create() {
  const lexer = new Lexer({ languageName: 'improviz' });

  lexer.addTokenType(whiteSpace);
  lexer.addTokenType(newline);
  lexer.addTokenType(comment);

  lexer.addTokenType(operator);

  lexer.addTokenType(comma);
  lexer.addTokenType(colon);
  lexer.addTokenType(pipe);
  lexer.addTokenType(lambdaArrow);
  lexer.addTokenType(assignment);
  lexer.addTokenType(blockArgSymbol);

  lexer.addTokenType(openParen);
  lexer.addTokenType(closeParen);

  lexer.addTokenType(openBracket);
  lexer.addTokenType(closeBracket);

  lexer.addTokenType(number);

  keywords.forEach(k => {
    lexer.addTokenType(StandardTokenTypes.constant(k, k));
  });

  lexer.addTokenType(identifier);

  return lexer;
}
