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
} from '../ast/nodes';

import { Lambda, Num, Null } from '../ast';

import { InterpreterError } from './errors';

function createChildScope(parentScope) {
  return Object.create(parentScope);
}

export class Interpreter {
  constructor(stdlib) {
    this.stdlib = stdlib;
  }

  run(ast, globalscope) {
    const state = {
      errors: [],
      exitCode: 0,
    };

    if (ast.type !== PROGRAM) {
      state.exitCode = 1;
      return state;
    }

    try {
      this.evaluateProgram(ast, globalscope);
    } catch (e) {
      state.errors.push(e);
      state.exitCode = 1;
    }
    return state;
  }

  evaluateProgram(ast, scope) {
    const childScope = createChildScope(scope);
    for (let i = 0; i < ast.statements.length; i += 1) {
      const el = ast.statements[i];
      this.evaluate(el, childScope);
    }
  }

  evaluate(node, scope) {
    let output;

    switch (node.type) {
      case BLOCK:
        output = this.evaluateBlock(node, scope);
        break;

      case LOOP:
        output = this.evaluateLoop(node, scope);
        break;

      case ASSIGNMENT:
      case CONDASSIGNMENT:
        output = this.evaluateAssignment(node, scope);
        break;

      case IF:
        output = this.evaluateIf(node, scope);
        break;

      case LAMBDA:
        output = this.evaluateLambda(node, scope);
        break;

      case FUNC:
        output = this.evaluateFunctionDefinition(node, scope);
        break;

      case APPLICATION:
        output = this.evaluateApplication(node, scope);
        break;

      case BINARYOP:
        output = this.evaluateBinaryOp(node, scope);
        break;

      case UNARYOP:
        output = this.evaluateUnaryOp(node, scope);
        break;

      case VARIABLE:
        output = this.evaluateVariable(node, scope);
        break;

      case INDEX:
        output = this.evaluateDeIndex(node, scope);
        break;

      case NUM:
        output = node;
        break;

      case SYMBOL:
        output = node;
        break;

      case LIST:
        output = node.values.map(v => {
          return this.evaluate(v, scope);
        });
        break;

      default:
        throw new InterpreterError(`Unknown AST Type: ${node.type}`, node);
    }

    return output;
  }

  evaluateBlock(block, scope) {
    const childScope = createChildScope(scope);
    let output = Null();
    for (let i = 0; i < block.elements.length; i += 1) {
      const el = block.elements[i];
      output = this.evaluate(el, childScope);
    }

    return output;
  }

  evaluateAssignment(assignment, scope) {
    const value = this.evaluate(assignment.expression, scope);
    if (assignment.type === ASSIGNMENT) {
      scope[assignment.identifier] = value;
    } else if (
      assignment.type === CONDASSIGNMENT &&
      (scope[assignment.identifier] === undefined ||
        scope[assignment.identifier].type === NULL)
    ) {
      scope[assignment.identifier] = value;
    }
    return value;
  }

  isNull(value) {
    return value === null || value === undefined || value.type === NULL;
  }

  notNull(value) {
    return value !== null && value !== undefined && value.type !== NULL;
  }

  truthyValue(value) {
    if (this.isNull(value)) return false;
    if (value.type === NUM && value.value === 0) return false;
    return true;
  }

  checkNum(value) {
    if (!value || value.type !== NUM) {
      throw new InterpreterError(
        `Expected Number but found: ${value.type}`,
        value
      );
    }
  }

  evaluateIf(ifStatement, scope) {
    const { conditionals } = ifStatement;
    for (let i = 0; i < conditionals.length; i += 1) {
      const { pred, block } = conditionals[i];
      if (this.truthyValue(this.evaluate(pred, scope))) {
        this.evaluateBlock(block, scope);
      }
    }
  }

  evaluateApplication(application, scope) {
    const { name, args, lambda } = application;

    const func = scope[name];
    if (!func || !(func.type !== LAMBDA || func.type !== BUILTIN)) {
      throw new InterpreterError(`${name} is not a function`, application);
    }

    const argValues = args.map(a => this.evaluate(a, scope));

    // FIXME think the scoping for application lambdas is buggered
    if (func.type === LAMBDA) {
      const childScope = this.notNull(func.scope)
        ? func.scope
        : createChildScope(scope);
      for (let i = 0; i < func.args.length; i += 1) {
        const arg = func.args[i];
        if (arg.type === VARARG) {
          childScope[arg.name] = argValues[i] || Null();
        } else if (arg.type === BLOCKARG && this.notNull(lambda)) {
          if (this.isNull(lambda.scope)) {
            lambda.scope = scope;
          }
          childScope[arg.name] = lambda;
        }
      }
      return this.evaluateBlock(func.body, childScope);
    } else if (func.type === BUILTIN) {
      return func.func(argValues, lambda);
    }
  }

  blockToLambda(block, scope) {
    return Lambda([], scope, block);
  }

  // FIXME
  evaluateLambda(node) {
    throw new InterpreterError(`Shouldn't be evaluating a lambda`, node);
  }

  evaluateFunctionDefinition(funcDef, scope) {
    const { name, args, body } = funcDef;
    const lambda = Lambda(args, scope, body);
    scope[name] = lambda;
  }

  evaluateLoop(loop, scope) {
    const { count, block, loopVar } = loop;

    const loops = this.evaluate(count, scope);
    if (loops.type !== NUM) {
      throw new InterpreterError('Loop count should be a number', count);
    }
    const loopValue = loops.value;
    const childScope = createChildScope(scope);

    for (let i = 0; i < loopValue; i += 1) {
      if (this.notNull(loopVar)) {
        childScope[loopVar.identifier] = Num(i);
      }

      this.evaluate(block, childScope);
    }
  }

  evaluateUnaryOp(operation, scope) {
    let output;
    const expr = this.evaluate(operation.expr, scope);
    this.checkNum(expr);
    const val = expr.value;

    switch (operation.operator) {
      case '-':
        output = -1 * val;
        break;

      default:
        throw new InterpreterError(
          `${operation.operator} is an unknown operator`,
          operation
        );
    }

    return Num(output);
  }

  evaluateBinaryOp(binaryOp, scope) {
    let output;
    const left = this.evaluate(binaryOp.left, scope);
    this.checkNum(left);
    const right = this.evaluate(binaryOp.right, scope);
    this.checkNum(right);
    const val1 = left.value;
    const val2 = right.value;

    switch (binaryOp.operator) {
      case '+':
        output = val1 + val2;
        break;

      case '-':
        output = val1 - val2;
        break;

      case '*':
        output = val1 * val2;
        break;

      case '/':
        output = val1 / val2;
        break;

      case '^':
        output = Math.pow(val1, val2);
        break;

      case '%':
        output = val1 % val2;
        break;

      case '>':
        output = val1 > val2 ? 1 : 0;
        break;

      case '<':
        output = val1 < val2 ? 1 : 0;
        break;

      case '>=':
        output = val1 >= val2 ? 1 : 0;
        break;

      case '<=':
        output = val1 <= val2 ? 1 : 0;
        break;

      case '==':
        output = val1 === val2 ? 1 : 0;
        break;

      case '&&':
        output = val1 && val2 ? 1 : 0;
        break;

      case '||':
        output = val1 || val2 ? 1 : 0;
        break;

      default:
        throw new InterpreterError(
          `${binaryOp.operator} is an unknown operator`,
          binaryOp
        );
    }

    return Num(output);
  }

  evaluateVariable(variable, scope) {
    const output = scope[variable.identifier];
    if (!this.notNull(output)) {
      throw new InterpreterError(
        `Undefined Variable: ${variable.identifier}`,
        variable
      );
    }
    return output;
  }

  evaluateDeIndex(deindex, scope) {
    const collection = this.evaluate(deindex.collection, scope);
    if (!Array.isArray(collection)) {
      throw new InterpreterError('Can only deindex a list', deindex);
    }
    const index = this.evaluate(deindex.index, scope);
    this.checkNum(index);
    return collection[index.value];
  }
}
