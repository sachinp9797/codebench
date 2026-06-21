import OpenAI from 'openai';
import type { Provider, ModelConfig, GenerateOptions, GenerateResult } from '@codebench/core';

export function createOpenAIProvider(model: ModelConfig): Provider {
  const client = new OpenAI();
  return {
    id: model.id,
    async generate(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
      const start = performance.now();
      const res = await client.chat.completions.create({
        model: model.id,
        max_completion_tokens: o.maxTokens ?? model.maxTokens,
        messages: [
          ...(o.systemPrompt ? [{ role: 'system' as const, content: o.systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
      });
      const totalMs = performance.now() - start;
      return {
        text: res.choices[0]?.message?.content ?? '',
        inputTokens: res.usage?.prompt_tokens ?? 0,
        outputTokens: res.usage?.completion_tokens ?? 0,
        ttftMs: totalMs,
        totalMs,
      };
    },
  };
}
