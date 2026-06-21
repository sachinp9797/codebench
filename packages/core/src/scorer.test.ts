import { expect, test } from 'vitest';
import { passAtK, costOfPass, aggregateByModel, matrix } from './scorer.js';
import type { RunResult } from './types.js';

test('passAtK: all correct => 1', () => {
  expect(passAtK(5, 5, 1)).toBe(1);
});

test('passAtK: none correct => 0', () => {
  expect(passAtK(5, 0, 1)).toBe(0);
});

test('passAtK: n-c<k guard => 1', () => {
  expect(passAtK(3, 2, 2)).toBe(1);
});

test('passAtK: n<k => throws', () => {
  expect(() => passAtK(2, 3, 3)).toThrow();
});

test('passAtK: known value pass@1 with n=2,c=1 => 0.5', () => {
  expect(passAtK(2, 1, 1)).toBeCloseTo(0.5, 6);
});

test('costOfPass: cost / passRate', () => {
  expect(costOfPass(10, 0.5)).toBe(20);
});

test('costOfPass: zero passRate => Infinity', () => {
  expect(costOfPass(10, 0)).toBe(Infinity);
});

function rr(p: Partial<RunResult>): RunResult {
  return {
    taskId: 't', modelId: 'm', promptConfigId: 'pc',
    samples: [], n: 1, c: 1, inputTokens: 10, outputTokens: 20,
    costUsd: 1, ttftMs: 0, totalMs: 0, temperature: 0, ...p,
  };
}

test('aggregateByModel groups and computes pass@1', () => {
  const rows = [
    rr({ modelId: 'a', n: 1, c: 1 }),
    rr({ modelId: 'a', n: 1, c: 0 }),
    rr({ modelId: 'b', n: 1, c: 1 }),
  ];
  const agg = aggregateByModel(rows);
  const a = agg.find((x) => x.modelId === 'a')!;
  expect(a.passAt1).toBeCloseTo(0.5, 6);
});

test('matrix builds model x prompt cells', () => {
  const rows = [rr({ modelId: 'a', promptConfigId: 'p1', n: 1, c: 1 })];
  const m = matrix(rows);
  expect(m[0].passAt1).toBe(1);
  expect(m[0].modelId).toBe('a');
  expect(m[0].promptConfigId).toBe('p1');
});
