import { ParserException } from '@rumblesan/virgil';

export class IncorrectIndentationException extends ParserException {
  constructor(expected, actual, token) {
    const msg = `Expected ${expected} levels of indentation but found ${actual}`;
    super(msg);
    this.name = 'IncorrectIndentationException';
    this.displayable = true;
    this.line = token.line;
    this.character = token.character;
    this.length = token.content.length;
  }
}
