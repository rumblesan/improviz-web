import {
  PROGRAM,
  BLOCK,
  LOOP,
  ASSIGNMENT,
  CONDASSIGNMENT,
  IF,
  LAMBDA,
  BUILTIN,
  FUNC,
  VARARG,
  BLOCKARG,
  APPLICATION,
  BINARYOP,
  UNARYOP,
  VARIABLE,
  INDEX,
  NUM,
  NULL,
  SYMBOL,
  LIST,
} from './nodes';

/**
 *  statements: [Statement]
 */
export function Program(statements) {
  return {
    type: PROGRAM,
    statements,
  };
}

/**
 *  elements: [Statement | Element]
 */
export function Block(elements) {
  return {
    type: BLOCK,
    elements,
  };
}

/* Statements and Elements */

/**
 *  count:   Expression
 *  block:   Block
 *  loopVar: Variable
 */
export function Loop(count, block, loopVar = Null(), { line, character } = {}) {
  return {
    type: LOOP,
    count,
    block,
    loopVar,
    line,
    character,
  };
}

/**
 *  identifier: Identifier
 *  expression: Expression
 */
export function Assignment(identifier, expression, { line, character } = {}) {
  return {
    type: ASSIGNMENT,
    identifier,
    expression,
    line,
    character,
  };
}

/**
 *  identifier: Identifier
 *  expression: Expression
 */
export function ConditionalAssignment(
  identifier,
  expression,
  { line, character } = {}
) {
  return {
    type: CONDASSIGNMENT,
    identifier,
    expression,
    line,
    character,
  };
}

/**
 *  conditionals: [[Expression, Block]]
 */
export function If(conditionals, { line, character } = {}) {
  return {
    type: IF,
    conditionals,
    line,
    character,
  };
}

/**
 *  args:   [FuncArg]
 *  scope:  Scope
 *  body:   Block
 */
export function Lambda(args, scope, body, { line, character } = {}) {
  return {
    type: LAMBDA,
    args,
    scope,
    body,
    line,
    character,
  };
}

/**
 *  args:   [FuncArg]
 *  scope:  Scope
 *  body:   Block
 */
export function BuiltIn(name, func) {
  return {
    type: BUILTIN,
    name,
    func,
  };
}

/**
 *  name:  Identifier
 *  args:  [FuncArg]
 *  body:  Block
 */
export function Func(name, args, body = Null(), { line, character } = {}) {
  return {
    type: FUNC,
    name,
    args,
    body,
    line,
    character,
  };
}

/* Function Arguments */

/**
 *  name:   Identifier
 */
export function VarArg(name, { line, character } = {}) {
  return {
    type: VARARG,
    name,
    line,
    character,
  };
}

/**
 *  name:   Identifier
 */
export function BlockArg(name, { line, character } = {}) {
  return {
    type: BLOCKARG,
    name,
    line,
    character,
  };
}

/* Expressions */

/**
 *  name:   Identifier
 *  args:   [Expression]
 *  lambda: Lambda?
 */
export function Application(
  name,
  args,
  lambda = Null(),
  { line, character } = {}
) {
  return {
    type: APPLICATION,
    name,
    args,
    lambda,
    line,
    character,
  };
}

/**
 *  operation: String
 *  left:      Expression
 *  right:     Expression
 */
export function BinaryOp(operator, left, right, { line, character } = {}) {
  return {
    type: BINARYOP,
    operator,
    left,
    right,
    line,
    character,
  };
}

/**
 *  operation: String
 *  expr:      Expression
 */
export function UnaryOp(operator, expr, { line, character } = {}) {
  return {
    type: UNARYOP,
    operator,
    expr,
    line,
    character,
  };
}

/**
 *  value: Identifier
 */
export function Variable(identifier, { line, character } = {}) {
  return {
    type: VARIABLE,
    identifier,
    line,
    character,
  };
}

/**
 *  collection: Expression
 *  index: Expression
 */
export function Index(collection, index, { line, character } = {}) {
  return {
    type: INDEX,
    collection,
    index,
    line,
    character,
  };
}

/* Values */

/**
 *  value: Number
 */
export function Num(value, { line, character } = {}) {
  return {
    type: NUM,
    value,
    line,
    character,
  };
}

/**
 */
export function Null({ line, character } = {}) {
  return {
    type: NULL,
    line,
    character,
  };
}

/**
 *  value: String
 */
export function Symbol(value, { line, character } = {}) {
  return {
    type: SYMBOL,
    value,
    line,
    character,
  };
}

/**
 *  value: List
 */
export function List(values, { line, character } = {}) {
  return {
    type: LIST,
    values,
    line,
    character,
  };
}
