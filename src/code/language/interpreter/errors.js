export class InterpreterError extends Error {
  constructor(message, token) {
    super(message);
    this.name = 'InterpreterError';
    this.line = token.line;
    this.character = token.character;
    this.length = token.content.length;
  }
}
