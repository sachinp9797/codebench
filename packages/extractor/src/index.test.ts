import { expect, test } from 'vitest';
import { fenceExtractor } from './index.js';

test('extracts fenced ```ts block', () => {
  const text = 'Here:\n```ts\nexport const x = 1;\n```\nDone.';
  expect(fenceExtractor.extract(text)).toBe('export const x = 1;');
});

test('extracts ```typescript fence', () => {
  const text = '```typescript\nconst y = 2;\n```';
  expect(fenceExtractor.extract(text)).toBe('const y = 2;');
});

test('falls back to raw text when no fence', () => {
  expect(fenceExtractor.extract('const z = 3;')).toBe('const z = 3;');
});

test('takes first of multiple fences', () => {
  const text = '```ts\nA\n```\ntext\n```ts\nB\n```';
  expect(fenceExtractor.extract(text)).toBe('A');
});

test('empty text returns empty string', () => {
  expect(fenceExtractor.extract('   ')).toBe('');
});
