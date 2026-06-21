import type { Provider, GenerateOptions, GenerateResult } from '@codebench/core';

export interface MockOptions {
  /** Fixed text to return, or a function of the prompt. */
  response: string | ((prompt: string) => string);
}

/** Token estimate: ~4 chars per token, deterministic. */
const estTokens = (s: string) => Math.max(1, Math.ceil(s.length / 4));

export function createMockProvider(opts: MockOptions): Provider {
  return {
    id: 'mock',
    async generate(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
      const text =
        typeof opts.response === 'function' ? opts.response(prompt) : opts.response;
      return {
        text,
        inputTokens: estTokens(o.systemPrompt + prompt),
        outputTokens: estTokens(text),
        ttftMs: 0,
        totalMs: 0,
      };
    },
  };
}
