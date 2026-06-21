import type { Provider, ModelConfig, GenerateOptions, GenerateResult } from '@codebench/core';

const HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';

export function createOllamaProvider(model: ModelConfig): Provider {
  const name = model.id.replace(/^ollama:/, '');
  return {
    id: model.id,
    async generate(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
      const start = performance.now();
      const res = await fetch(`${HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: name,
          stream: false,
          messages: [
            ...(o.systemPrompt ? [{ role: 'system', content: o.systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = (await res.json()) as {
        message?: { content?: string };
        prompt_eval_count?: number;
        eval_count?: number;
      };
      const totalMs = performance.now() - start;
      return {
        text: data.message?.content ?? '',
        inputTokens: data.prompt_eval_count ?? 0,
        outputTokens: data.eval_count ?? 0,
        ttftMs: totalMs,
        totalMs,
      };
    },
  };
}
