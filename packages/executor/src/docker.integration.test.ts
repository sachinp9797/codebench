import { expect, test, beforeAll } from 'vitest';
import Docker from 'dockerode';
import { createDockerExecutor } from './docker.js';

let dockerUp = false;
beforeAll(async () => {
  try {
    await Promise.race([
      new Docker().ping(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('docker ping timeout')), 5000)),
    ]);
    dockerUp = true;
  } catch { dockerUp = false; }
});

test('docker executor runs a passing solution', async (ctx) => {
  if (!dockerUp) ctx.skip();
  const exec = createDockerExecutor();
  const r = await exec.run(
    'export const sum=(a:number,b:number)=>a+b;',
    'assert(sum(2,3)===5);',
  );
  expect(r.passed).toBe(true);
}, 60000);

test('docker executor fails a wrong solution', async (ctx) => {
  if (!dockerUp) ctx.skip();
  const exec = createDockerExecutor();
  const r = await exec.run(
    'export const sum=(a:number,b:number)=>a+b;',
    'assert(sum(2,3)===6);',
  );
  expect(r.passed).toBe(false);
}, 60000);
