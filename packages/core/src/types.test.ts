import { expect, test } from 'vitest';
import { BenchTaskSchema, RunResultSchema } from './types.js';

test('valid BenchTask parses', () => {
  const t = BenchTaskSchema.parse({
    id: 'algo/sum',
    prompt: 'Implement sum(a,b).',
    canonicalSolution: 'export const sum=(a,b)=>a+b;',
    test: 'assert(sum(1,2)===3)',
    entryPoint: 'sum',
    language: 'typescript',
    difficulty: 'easy',
    releaseDate: '2026-01-01',
  });
  expect(t.entryPoint).toBe('sum');
});

test('BenchTask rejects bad difficulty', () => {
  expect(() =>
    BenchTaskSchema.parse({
      id: 'x', prompt: 'p', canonicalSolution: 's', test: 't',
      entryPoint: 'e', language: 'typescript', difficulty: 'trivial',
      releaseDate: '2026-01-01',
    }),
  ).toThrow();
});

test('RunResult requires token fields', () => {
  expect(() => RunResultSchema.parse({ taskId: 'x' })).toThrow();
});
