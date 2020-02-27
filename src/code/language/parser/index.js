import {
  ArithmaticShunter,
  Parser as VirgilParser,
  ParserException,
} from '@rumblesan/virgil';

import * as Lexer from './lexer';
import { IncorrectIndentationException } from './errors';

import * as ast from '../ast';

const operatorPrecedences = {
  '^': 15,
  '*': 14,
  '/': 14,
  '%': 14,
  '+': 13,
  '-': 13,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  '==': 10,
  '!=': 10,
  '&&': 6,
  '||': 5,
};

const BinaryOpConstructor = (opToken, value1Ast, value2Ast) => {
  // TODO pass position into BinaryOp
  return ast.BinaryOp(opToken.content, value1Ast, value2Ast, undefined, {});
};

class Parser extends VirgilParser {
  clearNewlines() {
    while (!this.eof() && this.la1('newline')) {
      this.match('newline');
    }
  }

  calculateBlockLevel(token) {
    const indentPerBlock = 2;
    return Math.round((token.character - 1) / indentPerBlock);
  }

  blockLevelMatch(blockLevel, token) {
    const indentLevel = this.calculateBlockLevel(token);
    if (blockLevel !== indentLevel) {
      return new IncorrectIndentationException(blockLevel, indentLevel, token);
    }
    return null;
  }

  parse(program, options = {}) {
    this.debugLog('With Debugging');
    this.errors = [];
    const lexer = Lexer.create();
    const lexResult = lexer.tokenize(program);
    lexResult.errors.forEach(err => this.errors.push(err));

    this.initialize(lexResult.tokens, options);
    const ast = this.program();

    return {
      ast,
      errors: this.errors,
    };
  }

  program() {
    this.debugLog('Program');

    const statements = [];
    const initialBlockLevel = 0;
    this.clearNewlines();
    while (!this.eof()) {
      statements.push(this.statement(initialBlockLevel));
    }
    return ast.Program(statements);
  }

  statement(blockLevel) {
    this.debugLog('Statement');

    if (this.la1('if')) {
      return this.if(blockLevel);
    }

    if (this.la1('func')) {
      return this.funcDef(blockLevel);
    }

    if (this.la1('loop')) {
      return this.loop(blockLevel);
    }

    if (this.la1('identifier')) {
      const idToken = this.match('identifier');

      let idErr = this.blockLevelMatch(blockLevel, idToken);
      if (idErr) {
        this.errors.push(idErr);
      }

      if (this.la1('assignment') || this.la1('colon')) {
        return this.assignment(idToken);
      }

      if (this.la1('open paren')) {
        return this.application(blockLevel, idToken);
      }
    }
    const t = this.peek();
    throw new ParserException(`Unexpected ${t.type}`);
  }

  block(blockLevel) {
    this.debugLog('Block');

    let i = 0;
    const elements = [];
    // FIXME need to know when block ends
    while (!this.eof()) {
      const nextToken = this.peek();
      const nextIndent = this.calculateBlockLevel(nextToken);
      if (nextIndent < blockLevel) break;
      i++;
      if (i > 20) {
        throw new ParserException('stack down');
      }
      elements.push(this.element(blockLevel));
    }
    return ast.Block(elements);
  }

  element(blockLevel) {
    this.debugLog('Element');

    if (this.la1('if')) {
      return this.if(blockLevel);
    }

    if (this.la1('func')) {
      return this.funcDef(blockLevel);
    }

    if (this.la1('loop')) {
      return this.loop(blockLevel);
    }

    if (this.la1('identifier')) {
      const idToken = this.match('identifier');
      let idErr = this.blockLevelMatch(blockLevel, idToken);
      if (idErr) {
        this.errors.push(idErr);
      }

      if (this.la1('assignment') || this.la1('colon')) {
        return this.assignment(idToken);
      }

      if (this.la1('open paren')) {
        return this.application(blockLevel, idToken);
      }
    }
    const t = this.peek();
    throw new ParserException(`Unexpected ${t.type}`);
  }

  if(blockLevel) {
    this.debugLog('If');
    const conditionals = [];
    const ifToken = this.match('if');
    let ifErr = this.blockLevelMatch(blockLevel, ifToken);
    if (ifErr) {
      throw ifErr;
    }
    const predicate = this.expression();
    this.clearNewlines();
    const ifBlock = this.block(blockLevel + 1);
    conditionals.push([predicate, ifBlock]);

    if (this.eof() || !this.la1('else')) {
      return ast.If(conditionals);
    }

    while (!this.eof() && this.la1('else')) {
      const elseToken = this.match('else');
      let elseErr = this.blockLevelMatch(blockLevel, elseToken);
      if (elseErr) {
        throw elseErr;
      }
      let predicate;
      if (this.la1('if')) {
        this.match('if');
        predicate = this.expression();
      } else {
        predicate = ast.Num(1);
      }
      this.clearNewlines();
      const block = this.block(blockLevel + 1);
      conditionals.push([predicate, block]);
    }

    return ast.If(conditionals);
  }

  funcDef(blockLevel) {
    this.debugLog('Function Definition');

    const funcToken = this.match('func');
    let funcErr = this.blockLevelMatch(blockLevel, funcToken);
    if (funcErr) {
      throw funcErr;
    }
    const name = this.match('identifier');
    this.match('open paren');
    const args = this.argList('close paren', 'comma');
    this.match('close paren');
    if (this.la1('lambda arrow')) {
      this.match('lambda arrow');
      const expr = this.expression();
      this.clearNewlines();
      return ast.Func(name.content, args, ast.Block([expr]));
    }
    this.clearNewlines();
    const body = this.block(blockLevel + 1);
    return ast.Func(name.content, args, body);
  }

  argList(endToken, delimiter) {
    const args = [];
    if (this.la1(endToken)) {
      this.debugLog('argList: 0 args');
      return args;
    }
    args.push(this.functionArg());
    while (this.la1(delimiter)) {
      this.match(delimiter);
      args.push(this.functionArg());
    }
    this.debugLog(`argList: ${args.length} args`);
    return args;
  }

  functionArg() {
    this.debugLog('Function Argument');

    if (this.la1('&')) {
      this.match('&');
      const id = this.match('identifier');
      return ast.BlockArg(id.content);
    }
    const id = this.match('identifier');
    return ast.VarArg(id.content);
  }

  loop(blockLevel) {
    this.debugLog('Loop');

    const loopToken = this.match('loop');
    let loopErr = this.blockLevelMatch(blockLevel, loopToken);
    if (loopErr) {
      throw loopErr;
    }
    const countExpr = this.expression();
    this.match('times');
    let loopVar = ast.Null();
    if (this.la1('with')) {
      this.match('with');
      loopVar = this.variable();
    }
    this.clearNewlines();
    const loopBlock = this.block(blockLevel + 1);
    return ast.Loop(countExpr, loopBlock, loopVar);
  }

  assignment(idToken) {
    this.debugLog('Assignment');

    if (this.la1('colon')) {
      this.match('colon');
      this.match('assignment');
      const expr = this.expression();
      return ast.ConditionalAssignment(idToken.content, expr);
    }
    this.match('assignment');
    const expr = this.expression();
    this.clearNewlines();
    return ast.Assignment(idToken.content, expr);
  }

  application(blockLevel, idToken) {
    this.debugLog('Application');

    this.match('open paren');
    const args = this.exprList();
    this.match('close paren');

    // FIXME this is ugly!!
    if (this.eof() || !this.la1('newline')) {
      return ast.Application(idToken.content, args);
    }
    this.clearNewlines();
    if (this.eof()) {
      return ast.Application(idToken.content, args);
    }

    const nextIndent = this.calculateBlockLevel(this.peek());
    if (nextIndent <= blockLevel) {
      return ast.Application(idToken.content, args);
    } else {
      const lambda = this.applicationLambda(blockLevel + 1);
      return ast.Application(idToken.content, args, lambda);
    }
  }

  applicationLambda(blockLevel) {
    let args = [];
    if (this.la1('pipe')) {
      const pipeToken = this.match('pipe');
      let blockErr = this.blockLevelMatch(blockLevel, pipeToken);
      if (blockErr) {
        throw blockErr;
      }
      args = this.argList('pipe', 'comma');
      this.match('pipe');
      this.match('newline');
    }
    const block = this.block(blockLevel);
    return ast.Lambda(args, ast.Null(), block);
  }

  expressionApplication(idToken) {
    this.match('open paren');
    const args = this.exprList();
    this.match('close paren');

    return ast.Application(idToken.content, args);
  }

  exprList() {
    const args = [];
    if (this.la1('close paren')) {
      this.debugLog('exprList: 0 args');
      return args;
    }
    args.push(this.expression());
    while (this.la1('comma')) {
      this.match('comma');
      args.push(this.expression());
    }
    this.debugLog(`exprList: ${args.length} args`);
    return args;
  }

  expression() {
    this.debugLog('Expression');

    let left = this.baseExpression();
    if (!this.eof() && this.la1('operator')) {
      return this.operator(left);
    }
    return left;
  }

  operator(left) {
    this.debugLog('Operator');

    const shunter = new ArithmaticShunter(operatorPrecedences, {
      astConstructor: BinaryOpConstructor,
    });
    shunter.shuntValue(left);
    while (!this.eof() && this.la1('operator')) {
      shunter.shuntOp(this.match('operator'));
      shunter.shuntValue(this.baseExpression());
    }
    return shunter.getOutput();
  }

  baseExpression() {
    this.debugLog('Base Expression');

    let initial;
    if (this.la1('number')) {
      initial = this.number();
    } else if (this.la1('open paren')) {
      this.match('open paren');
      initial = this.expression();
      this.match('close paren');
    } else if (this.la1('operator')) {
      const op = this.match('operator');
      const expr = this.baseExpression();
      initial = ast.UnaryOp(op.content, expr);
    } else if (this.la1('colon')) {
      this.match('colon');
      const symbolToken = this.match('identifier');
      initial = ast.Symbol(symbolToken.content);
    } else if (this.la1('null')) {
      this.match('null');
      initial = ast.Null();
    } else if (this.la1('open bracket')) {
      this.match('open bracket');
      const values = this.exprList();
      this.match('close bracket');
      initial = ast.List(values);
    } else if (this.la1('identifier')) {
      const idToken = this.match('identifier');
      if (!this.eof() && this.la1('open paren')) {
        initial = this.expressionApplication(idToken);
      } else {
        initial = ast.Variable(idToken.content);
      }
    }

    while (!this.eof() && this.la1('open bracket')) {
      this.match('open bracket');
      const idx = this.expression();
      this.match('close bracket');
      initial = ast.Index(initial, idx);
    }
    return initial;
  }

  number() {
    this.debugLog('Number');

    const num = this.match('number');
    return ast.Num(num.content);
  }

  variable() {
    this.debugLog('Variable');

    const id = this.match('identifier');
    return ast.Variable(id.content);
  }
}

export default Parser;
