import type { RunResult } from './types.js';

/** Unbiased pass@k estimator (Codex paper). Guards n<k. */
export function passAtK(n: number, c: number, k: number): number {
  if (n < k) throw new Error(`passAtK requires n>=k (n=${n}, k=${k})`);
  if (n - c < k) return 1;
  let p = 1;
  for (let i = n - c + 1; i <= n; i++) p *= 1 - k / i;
  return 1 - p;
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Standard error of the mean. */
export function sem(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance / xs.length);
}

export function costOfPass(totalCostUsd: number, passRate: number): number {
  if (passRate === 0) return Infinity;
  return totalCostUsd / passRate;
}

export function tokensPerCorrect(totalOutputTokens: number, cCorrect: number): number {
  if (cCorrect === 0) return Infinity;
  return totalOutputTokens / cCorrect;
}

export interface ModelAgg {
  modelId: string;
  passAt1: number;
  passAt1Sem: number;
  costOfPass: number;
  tokensPerCorrect: number;
  totalCostUsd: number;
  avgTotalMs: number;
}

export interface PromptAgg {
  promptConfigId: string;
  passAt1: number;
  passAt1Sem: number;
  costOfPass: number;
}

export interface MatrixCell {
  modelId: string;
  promptConfigId: string;
  passAt1: number;
}

function summarize(rows: RunResult[]): {
  perTaskPass: number[];
  totalCost: number;
  totalOut: number;
  cTotal: number;
  avgMs: number;
} {
  const perTaskPass = rows.map((r) => passAtK(r.n, r.c, 1));
  return {
    perTaskPass,
    totalCost: rows.reduce((a, r) => a + r.costUsd, 0),
    totalOut: rows.reduce((a, r) => a + r.outputTokens, 0),
    cTotal: rows.reduce((a, r) => a + r.c, 0),
    avgMs: mean(rows.map((r) => r.totalMs)),
  };
}

function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    (m.get(k) ?? m.set(k, []).get(k)!).push(r);
  }
  return m;
}

export function aggregateByModel(rows: RunResult[]): ModelAgg[] {
  return [...groupBy(rows, (r) => r.modelId)].map(([modelId, group]) => {
    const s = summarize(group);
    const passAt1 = mean(s.perTaskPass);
    return {
      modelId,
      passAt1,
      passAt1Sem: sem(s.perTaskPass),
      costOfPass: costOfPass(s.totalCost, passAt1),
      tokensPerCorrect: tokensPerCorrect(s.totalOut, s.cTotal),
      totalCostUsd: s.totalCost,
      avgTotalMs: s.avgMs,
    };
  });
}

export function aggregateByPrompt(rows: RunResult[]): PromptAgg[] {
  return [...groupBy(rows, (r) => r.promptConfigId)].map(([promptConfigId, group]) => {
    const s = summarize(group);
    const passAt1 = mean(s.perTaskPass);
    return {
      promptConfigId,
      passAt1,
      passAt1Sem: sem(s.perTaskPass),
      costOfPass: costOfPass(s.totalCost, passAt1),
    };
  });
}

export function matrix(rows: RunResult[]): MatrixCell[] {
  return [...groupBy(rows, (r) => `${r.modelId}|${r.promptConfigId}`)].map(
    ([, group]) => ({
      modelId: group[0].modelId,
      promptConfigId: group[0].promptConfigId,
      passAt1: mean(group.map((r) => passAtK(r.n, r.c, 1))),
    }),
  );
}
