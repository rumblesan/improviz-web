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

export class Parser extends VirgilParser {
  clearNewlines() {
    while (!this.eof() && this.la1('newline')) {
      this.match('newline');
    }
  }

  calculateBlockLevel(token) {
    const indentPerBlock = 2;
    return Math.round((token.character - 1) / indentPerBlock);
  }

  tokenPosition(token) {
    if (this.testing) return {};

    return { line: token.line, character: token.character };
  }

  blockDepthCheck(currentBlockDepth, token) {
    const nextBlockDepth = this.calculateBlockLevel(token);
    if (currentBlockDepth !== nextBlockDepth) {
      this.errors.push(
        new IncorrectIndentationException(
          currentBlockDepth,
          nextBlockDepth,
          token
        )
      );
    }
    return nextBlockDepth;
  }

  skipUntil(stopTokens) {
    while (!this.eof()) {
      const t = this.peek();
      if (stopTokens.includes(t.type)) break;
      this.next();
    }
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

  statement(blockDepth) {
    this.debugLog('Statement');

    if (this.la1('if')) {
      return this.if(blockDepth);
    }

    if (this.la1('func')) {
      return this.funcDef(blockDepth);
    }

    if (this.la1('loop')) {
      return this.loop(blockDepth);
    }

    if (this.la1('identifier')) {
      const idToken = this.match('identifier');

      this.blockDepthCheck(blockDepth, idToken);

      if (this.la1('assignment') || this.la1('colon')) {
        return this.assignment(idToken);
      }

      if (this.la1('open paren')) {
        return this.application(blockDepth, idToken);
      }
    }
    const t = this.peek();
    this.errors.push(new ParserException(`Unexpected ${t.type}`));
    this.skipUntil(['newline']);
    this.clearNewlines();
  }

  block(blockDepth) {
    this.debugLog('Block');

    let currentBlockDepth = blockDepth;
    const elements = [];
    // FIXME need to know when block ends
    while (!this.eof()) {
      const nextToken = this.peek();
      const nextBlockDepth = this.calculateBlockLevel(nextToken);
      if (nextBlockDepth < currentBlockDepth) break;
      elements.push(this.element(blockDepth));
    }
    return ast.Block(elements);
  }

  element(blockDepth) {
    this.debugLog('Element');

    if (this.la1('if')) {
      return this.if(blockDepth);
    }

    if (this.la1('func')) {
      return this.funcDef(blockDepth);
    }

    if (this.la1('loop')) {
      return this.loop(blockDepth);
    }

    if (this.la1('identifier')) {
      const idToken = this.match('identifier');
      this.blockDepthCheck(blockDepth, idToken);

      if (this.la1('assignment') || this.la1('colon')) {
        return this.assignment(idToken);
      }

      if (this.la1('open paren')) {
        return this.application(blockDepth, idToken);
      }
    }
    const t = this.peek();
    this.errors.push(new ParserException(`Unexpected ${t.type}`));
    this.skipUntil(['newline']);
    this.clearNewlines();
  }

  if(blockDepth) {
    this.debugLog('If');

    const position = this.position();
    const conditionals = [];

    const ifToken = this.match('if');
    this.blockDepthCheck(blockDepth, ifToken);

    let predicate;
    try {
      predicate = this.expression();
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
      predicate = ast.Null();
    }
    this.clearNewlines();

    const ifBlock = this.block(blockDepth + 1);
    conditionals.push([predicate, ifBlock]);

    if (this.eof() || !this.la1('else')) {
      return ast.If(conditionals, position);
    }

    while (!this.eof() && this.la1('else')) {
      const elseToken = this.match('else');
      this.blockDepthCheck(blockDepth, elseToken);
      let predicate;
      if (this.la1('if')) {
        this.match('if');
        try {
          predicate = this.expression();
        } catch (e) {
          this.errors.push(e);
          this.resetStream('newline');
          predicate = ast.Null();
        }
      } else {
        predicate = ast.Num(1);
      }
      this.clearNewlines();
      const block = this.block(blockDepth + 1);
      conditionals.push([predicate, block]);
    }

    return ast.If(conditionals, position);
  }

  funcDef(blockDepth) {
    this.debugLog('Function Definition');

    const position = this.position();
    const funcToken = this.match('func');
    this.blockDepthCheck(blockDepth, funcToken);

    let name;
    let args;
    let expr;

    try {
      name = this.match('identifier').content;
      this.match('open paren');
      args = this.argList('close paren', 'comma');
      this.match('close paren');
      if (this.la1('lambda arrow')) {
        this.match('lambda arrow');
        expr = this.expression();
        this.clearNewlines();
        return ast.Func(name, args, ast.Block([expr]), position);
      }
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
    }

    this.clearNewlines();
    const body = this.block(blockDepth + 1);
    return ast.Func(name, args, body, position);
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

    // FIXME better error handling could happen here
    if (this.la1('&')) {
      this.match('&');
      const id = this.match('identifier');
      return ast.BlockArg(id.content);
    }
    const id = this.match('identifier');
    return ast.VarArg(id.content);
  }

  loop(blockDepth) {
    this.debugLog('Loop');

    const position = this.position();

    const loopToken = this.match('loop');
    this.blockDepthCheck(blockDepth, loopToken);

    let countExpr;
    let loopVar;
    try {
      countExpr = this.expression();
      this.match('times');
      loopVar = ast.Null();
      if (this.la1('with')) {
        this.match('with');
        loopVar = this.variable();
      }
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
    }
    this.clearNewlines();
    const loopBlock = this.block(blockDepth + 1);
    return ast.Loop(countExpr, loopBlock, loopVar, position);
  }

  assignment(idToken) {
    this.debugLog('Assignment');

    const position = this.tokenPosition(idToken);

    let expr;

    if (this.la1('colon')) {
      try {
        this.match('colon');
        this.match('assignment');
        expr = this.expression();
      } catch (e) {
        this.errors.push(e);
        this.resetStream('newline');
      }
      return ast.ConditionalAssignment(idToken.content, expr, position);
    }

    try {
      this.match('assignment');
      expr = this.expression();
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
    }
    this.clearNewlines();
    return ast.Assignment(idToken.content, expr, position);
  }

  application(blockDepth, idToken) {
    this.debugLog('Application');

    const position = this.tokenPosition(idToken);

    let args;
    try {
      this.match('open paren');
      args = this.exprList();
      this.match('close paren');
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
    }

    if (this.eof() || !this.la1('newline')) {
      return ast.Application(idToken.content, args, ast.Null(), position);
    }
    this.clearNewlines();
    if (this.eof()) {
      return ast.Application(idToken.content, args, ast.Null(), position);
    }

    const nextIndent = this.calculateBlockLevel(this.peek());
    if (nextIndent <= blockDepth) {
      return ast.Application(idToken.content, args, ast.Null(), position);
    } else {
      const lambda = this.applicationLambda(blockDepth + 1);
      return ast.Application(idToken.content, args, lambda, position);
    }
  }

  applicationLambda(blockDepth) {
    let position = this.position();
    let args = [];
    if (this.la1('pipe')) {
      const pipeToken = this.match('pipe');
      this.blockDepthCheck(blockDepth, pipeToken);
      try {
        args = this.argList('pipe', 'comma');
        this.match('pipe');
        this.match('newline');
      } catch (e) {
        this.errors.push(e);
        this.resetStream('newline');
      }
    }
    const block = this.block(blockDepth);
    return ast.Lambda(args, ast.Null(), block, position);
  }

  expressionApplication(idToken) {
    let args;
    let position = this.position();
    try {
      this.match('open paren');
      args = this.exprList();
      this.match('close paren');
    } catch (e) {
      this.errors.push(e);
      this.resetStream('newline');
    }

    return ast.Application(idToken.content, args, ast.Null(), position);
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
      let expr;
      try {
        expr = this.expression();
      } catch (e) {
        this.errors.push(e);
        this.resetStream('comma');
      }
      args.push(expr);
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
    const position = this.position();
    const num = this.match('number');
    return ast.Num(num.content, position);
  }

  variable() {
    this.debugLog('Variable');
    const position = this.position();
    const id = this.match('identifier');
    return ast.Variable(id.content, position);
  }
}
