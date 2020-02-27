/* global CodeMirror */

import { tokenIdentifiers } from '../language/parser/lexer';

CodeMirror.defineMode('improviz', function() {
  const ERRORCLASS = 'error';

  const identifierRe = tokenIdentifiers.identifier.regexp;
  const numberRe = tokenIdentifiers.number.regexp;
  const operatorRe = tokenIdentifiers.operator.regexp;
  const commentRe = tokenIdentifiers.comment.regexp;

  function tokenise(stream) {
    const ch = stream.peek();
    switch (ch) {
      case ',':
        stream.next();
        return 'atom';
      case '.':
        stream.next();
        return 'operator';
      case '(':
      case ')':
        stream.next();
        return 'bracket';
      default:
      // fallthrough
    }

    if (stream.eatSpace()) {
      return null;
    }

    if (stream.match(identifierRe)) {
      return 'variable';
    } else if (stream.match(numberRe)) {
      return 'number';
    } else if (stream.match(operatorRe)) {
      return 'operator';
    } else if (stream.match(commentRe)) {
      return 'comment';
    }

    stream.next();
    return ERRORCLASS;
  }

  return {
    token: tokenise,
  };
});

CodeMirror.defineMIME('text/x-improviz', 'improviz');
