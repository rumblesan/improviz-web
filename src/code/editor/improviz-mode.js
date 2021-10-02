import { Lexer } from '@improviz/language';

const { tokenIdentifiers, keywords } = Lexer;

export default function defineImprovizMode(CodeMirror) {
  CodeMirror.defineMode('improviz', function() {
    const ERRORCLASS = 'error';

    const identifierRe = tokenIdentifiers.identifier.regexp;
    const numberRe = tokenIdentifiers.number.regexp;
    const operatorRe = tokenIdentifiers.operator.regexp;
    const commentRe = tokenIdentifiers.comment.regexp;

    const globalVars = ['time', 'pi'];

    function tokenise(stream, state) {
      const ch = stream.peek();
      switch (ch) {
        case ':':
          stream.next();
          return checkColon(stream, state);
        case ',':
          stream.next();
          return 'atom';
        case '(':
        case ')':
        case '[':
        case ']':
        case '|':
          stream.next();
          return 'bracket';
        case '=':
          stream.next();
          return 'keyword';
        default:
        // fallthrough
      }

      if (stream.eatSpace()) {
        return null;
      }

      let match;
      if ((match = stream.match(identifierRe))) {
        return checkIdentifier(stream, state, match[0]);
      } else if (stream.match(numberRe)) {
        return 'number';
      } else if (stream.match(commentRe)) {
        return 'comment';
      } else if (stream.match(operatorRe)) {
        return 'operator';
      }

      stream.next();
      return ERRORCLASS;
    }

    function checkIdentifier(stream, state, match) {
      if (globalVars.includes(match)) {
        return 'tag';
      }
      if (keywords.includes(match)) {
        return 'keyword';
      }

      if (stream.peek() === '(') {
        return 'variable-2';
      }

      return 'variable';
    }

    function checkColon(stream) {
      const ch = stream.peek();
      if (ch === '=') {
        return 'keyword';
      } else if (stream.match(identifierRe)) {
        return 'string';
      }
      return ERRORCLASS;
    }

    return {
      startState: function() {
        return {};
      },
      token: tokenise,
    };
  });

  CodeMirror.defineMIME('text/x-improviz', 'improviz');
}
