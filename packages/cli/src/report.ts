import {
  aggregateByModel, aggregateByPrompt, matrix, type RunArtifact,
} from '@codebench/core';

const fmt = (n: number, digits = 4) => (Number.isFinite(n) ? n.toFixed(digits) : '∞');

export function renderReport(a: RunArtifact): string {
  const lines: string[] = [];
  lines.push(`# CodeBench run ${a.runId} (${a.startedAt})`);
  lines.push(`pricing: ${a.pricingVersion}  tasks: ${a.tasks.length}\n`);

  lines.push('## Model leaderboard (pass@1)');
  for (const m of aggregateByModel(a.results).sort((x, y) => y.passAt1 - x.passAt1)) {
    lines.push(
      `  ${m.modelId.padEnd(22)} pass@1=${(m.passAt1 * 100).toFixed(1)}%` +
        ` ±${(m.passAt1Sem * 100).toFixed(1)}  cost/pass=$${fmt(m.costOfPass)}` +
        `  tok/correct=${fmt(m.tokensPerCorrect, 0)}  ${m.avgTotalMs.toFixed(0)}ms`,
    );
  }

  lines.push('\n## Prompt leaderboard (pass@1)');
  for (const p of aggregateByPrompt(a.results).sort((x, y) => y.passAt1 - x.passAt1)) {
    lines.push(`  ${p.promptConfigId.padEnd(22)} pass@1=${(p.passAt1 * 100).toFixed(1)}%`);
  }

  lines.push('\n## Model x Prompt matrix (pass@1)');
  for (const cell of matrix(a.results)) {
    lines.push(`  ${cell.modelId} | ${cell.promptConfigId}: ${(cell.passAt1 * 100).toFixed(1)}%`);
  }

  return lines.join('\n');
}
