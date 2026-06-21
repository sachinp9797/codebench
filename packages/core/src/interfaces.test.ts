import { expect, test } from 'vitest';
import type { Provider, GenerateResult } from './interfaces.js';

test('a Provider can be implemented', async () => {
  const p: Provider = {
    id: 'fake',
    async generate() {
      const r: GenerateResult = {
        text: 'hi', inputTokens: 1, outputTokens: 1, ttftMs: 0, totalMs: 0,
      };
      return r;
    },
  };
  const r = await p.generate('prompt', { systemPrompt: '', temperature: 0 });
  expect(r.text).toBe('hi');
});
