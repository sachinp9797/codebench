import { expect, test } from 'vitest';
import { buildHarness } from './harness.js';

test('harness concatenates solution and test with assert helper', () => {
  const nonce = 'test-nonce-123';
  const out = buildHarness('export const sum=(a:number,b:number)=>a+b;', 'assert(sum(1,2)===3);', nonce);
  expect(out).toContain('sum(1,2)===3');
  expect(out).toContain('function assert');
  expect(out).toContain('__PASS__' + nonce);
});
