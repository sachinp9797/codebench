import { expect, test, vi } from 'vitest';
import { createOllamaProvider } from './ollama.js';

test('ollama parses /api/chat response and tokens', async () => {
  const fakeFetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      message: { content: 'export const x=1;' },
      prompt_eval_count: 12,
      eval_count: 7,
    }),
  })) as unknown as typeof fetch;
  vi.stubGlobal('fetch', fakeFetch);

  const p = createOllamaProvider({ id: 'ollama:llama3.1', provider: 'ollama', maxTokens: 100 });
  const r = await p.generate('prompt', { systemPrompt: 's' });
  expect(r.text).toBe('export const x=1;');
  expect(r.inputTokens).toBe(12);
  expect(r.outputTokens).toBe(7);
  vi.unstubAllGlobals();
});

test('ollama guards missing token counts to 0', async () => {
  const fakeFetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ message: { content: 'x' } }),
  })) as unknown as typeof fetch;
  vi.stubGlobal('fetch', fakeFetch);
  const p = createOllamaProvider({ id: 'ollama:llama3.1', provider: 'ollama', maxTokens: 100 });
  const r = await p.generate('p', { systemPrompt: '' });
  expect(r.inputTokens).toBe(0);
  expect(r.outputTokens).toBe(0);
  vi.unstubAllGlobals();
});
