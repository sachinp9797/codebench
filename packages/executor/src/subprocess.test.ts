import { expect, test } from 'vitest';
import { subprocessExecutor } from './subprocess.js';

test('passing solution => passed true', async () => {
  const r = await subprocessExecutor.run(
    'export const sum=(a:number,b:number)=>a+b;',
    'assert(sum(2,3)===5);',
  );
  expect(r.passed).toBe(true);
}, 20000);

test('failing assertion => passed false, errorKind assertion', async () => {
  const r = await subprocessExecutor.run(
    'export const sum=(a:number,b:number)=>a+b;',
    'assert(sum(2,3)===6);',
  );
  expect(r.passed).toBe(false);
  expect(r.errorKind).toBe('assertion');
}, 20000);

test('infinite loop => timed out', async () => {
  const r = await subprocessExecutor.run(
    'export const f=()=>{while(true){}};',
    'f();',
  );
  expect(r.timedOut).toBe(true);
  expect(r.errorKind).toBe('timeout');
}, 20000);
