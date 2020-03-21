export class InvalidProgramError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidProgramError';
  }
}

export class InterpreterError extends Error {
  constructor(message, node) {
    super(message);
    this.name = 'InterpreterError';
    this.line = node.line;
    this.character = node.character;
  }
}
