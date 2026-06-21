import type { Extractor } from '@codebench/core';

const FENCE = /```(?:ts|typescript|js|javascript)?\s*\n([\s\S]*?)```/i;

export const fenceExtractor: Extractor = {
  extract(text: string): string {
    const m = FENCE.exec(text);
    if (m) return m[1].trim();
    return text.trim();
  },
};
