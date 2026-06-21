export const PRICING_VERSION = '2026-06-21';

interface Rate { inputPerM: number; outputPerM: number }

const PRICING: Record<string, Rate> = {
  'claude-opus-4-8': { inputPerM: 5.0, outputPerM: 25.0 },
  'claude-sonnet-4-6': { inputPerM: 3.0, outputPerM: 15.0 },
  'claude-haiku-4-5': { inputPerM: 1.0, outputPerM: 5.0 },
  'gpt-5.5': { inputPerM: 5.0, outputPerM: 30.0 },
  'gpt-5.4': { inputPerM: 2.5, outputPerM: 15.0 },
  'gpt-5': { inputPerM: 0.625, outputPerM: 5.0 },
  'gpt-5-mini': { inputPerM: 0.125, outputPerM: 1.0 },
  'gemini-2.5-pro': { inputPerM: 1.25, outputPerM: 10.0 },
  'gemini-2.5-flash': { inputPerM: 0.3, outputPerM: 2.5 },
};

/** Local/mock models are free; ids are prefixed "ollama:" or "mock:". */
export function cost(modelId: string, inTok: number, outTok: number): number {
  if (modelId.startsWith('ollama:') || modelId.startsWith('mock:')) return 0;
  const r = PRICING[modelId];
  if (!r) throw new Error(`No pricing for model "${modelId}" (update pricing.ts)`);
  return (inTok / 1e6) * r.inputPerM + (outTok / 1e6) * r.outputPerM;
}
