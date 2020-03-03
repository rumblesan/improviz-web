/* global describe, it, parserErrorTest */

import { dedent } from 'dentist';

import { ParserException } from '@rumblesan/virgil';

import { Parser } from '../index';
import { IncorrectIndentationException } from '../errors';

describe('Errors', function() {
  it(
    'missing keyword error gets caught',
    parserErrorTest(
      new Parser(),
      dedent(`
        3 times
          box()
      `),
      [ParserException, IncorrectIndentationException]
    )
  );
});
