export class InterpreterError extends Error {
  constructor(message, node) {
    super(message);
    this.name = 'InterpreterError';
    this.line = node.line;
    this.character = node.character;
  }
}
