import { expect, test } from 'vitest';
import { cost, PRICING_VERSION } from './pricing.js';

test('cost computes from per-million rates', () => {
  // opus: 5 in / 25 out per 1M
  expect(cost('claude-opus-4-8', 1_000_000, 1_000_000)).toBeCloseTo(30, 6);
});

test('cost is zero for local ollama models', () => {
  expect(cost('ollama:llama3.1', 1000, 1000)).toBe(0);
});

test('cost is zero for mock models', () => {
  expect(cost('mock:m1', 1000, 1000)).toBe(0);
});

test('cost throws on unknown model', () => {
  expect(() => cost('nonexistent-model', 1, 1)).toThrow();
});

test('pricing version is set', () => {
  expect(PRICING_VERSION).toMatch(/\d{4}-\d{2}-\d{2}/);
});
