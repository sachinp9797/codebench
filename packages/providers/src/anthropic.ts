import Anthropic from '@anthropic-ai/sdk';
import type { Provider, ModelConfig, GenerateOptions, GenerateResult } from '@codebench/core';

export function createAnthropicProvider(model: ModelConfig): Provider {
  const client = new Anthropic();
  return {
    id: model.id,
    async generate(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
      const start = performance.now();
      // Opus 4.8/4.7 reject temperature — only send it for other models.
      const sendTemp = o.temperature !== undefined && !model.id.startsWith('claude-opus-4');
      const res = await client.messages.create({
        model: model.id,
        max_tokens: o.maxTokens ?? model.maxTokens,
        system: o.systemPrompt || undefined,
        ...(sendTemp ? { temperature: o.temperature } : {}),
        messages: [{ role: 'user', content: prompt }],
      });
      const totalMs = performance.now() - start;
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      return {
        text,
        inputTokens: res.usage.input_tokens,
        outputTokens: res.usage.output_tokens,
        ttftMs: totalMs,
        totalMs,
      };
    },
  };
}
