import { GoogleGenAI } from '@google/genai';
import type { Provider, ModelConfig, GenerateOptions, GenerateResult } from '@codebench/core';

export function createGeminiProvider(model: ModelConfig): Provider {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return {
    id: model.id,
    async generate(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
      const start = performance.now();
      const res = await ai.models.generateContent({
        model: model.id,
        contents: prompt,
        config: {
          maxOutputTokens: o.maxTokens ?? model.maxTokens,
          ...(o.systemPrompt ? { systemInstruction: o.systemPrompt } : {}),
          ...(o.temperature !== undefined ? { temperature: o.temperature } : {}),
        },
      });
      const totalMs = performance.now() - start;
      const u = res.usageMetadata;
      return {
        text: res.text ?? '',
        inputTokens: u?.promptTokenCount ?? 0,
        outputTokens: u?.candidatesTokenCount ?? 0,
        ttftMs: totalMs,
        totalMs,
      };
    },
  };
}
