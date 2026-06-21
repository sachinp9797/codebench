import { expect, test } from 'vitest';
import { createProvider } from './registry.js';

test('registry returns mock provider for provider=mock', () => {
  const p = createProvider({ id: 'mock', provider: 'mock', maxTokens: 100 });
  expect(p.id).toBe('mock');
});

test('registry throws for unconfigured api key providers gracefully at call, not build', () => {
  // anthropic provider can be constructed; it only needs a key at call time
  const p = createProvider({ id: 'claude-opus-4-8', provider: 'anthropic', maxTokens: 100 });
  expect(p.id).toBe('claude-opus-4-8');
});
