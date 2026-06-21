import type { Provider, ModelConfig } from '@codebench/core';
import { createMockProvider } from './mock.js';
import { createAnthropicProvider } from './anthropic.js';
import { createOpenAIProvider } from './openai.js';
import { createGeminiProvider } from './gemini.js';
import { createOllamaProvider } from './ollama.js';

export function createProvider(model: ModelConfig): Provider {
  switch (model.provider) {
    case 'mock':
      return createMockProvider({ response: '' });
    case 'anthropic':
      return createAnthropicProvider(model);
    case 'openai':
      return createOpenAIProvider(model);
    case 'gemini':
      return createGeminiProvider(model);
    case 'ollama':
      return createOllamaProvider(model);
  }
}
