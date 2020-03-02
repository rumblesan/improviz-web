/* global describe, it, parserTest */

import { Parser } from '../index';
import { Assignment, Program, Symbol } from '../../ast';

describe('Parser - symbols', function() {
  it(
    'simple symbol assignment passes',
    parserTest(
      new Parser(),
      'a = :hello',
      Program([Assignment('a', Symbol('hello'))])
    )
  );
});
