import { expect, test } from 'vitest';
import { createMockProvider } from './mock.js';

test('mock returns the configured response and token counts', async () => {
  const p = createMockProvider({ response: '```ts\nexport const x=1;\n```' });
  const r = await p.generate('prompt', { systemPrompt: 's' });
  expect(r.text).toContain('export const x=1;');
  expect(r.inputTokens).toBeGreaterThan(0);
  expect(r.outputTokens).toBeGreaterThan(0);
});

test('mock is deterministic for the same prompt', async () => {
  const p = createMockProvider({ response: 'fixed' });
  const a = await p.generate('p', { systemPrompt: '' });
  const b = await p.generate('p', { systemPrompt: '' });
  expect(a.inputTokens).toBe(b.inputTokens);
});
