import { expect, test } from 'vitest';
import { renderReport } from './report.js';
import type { RunArtifact } from '@codebench/core';

const artifact: RunArtifact = {
  runId: 'r', startedAt: 't', pricingVersion: '2026-06-21',
  tasks: ['easy/sum'],
  models: [{ id: 'claude-haiku-4-5', provider: 'anthropic', maxTokens: 100 }],
  promptConfigs: [{ id: 'minimal', label: 'M', systemPrompt: 's', temperature: 0 }],
  results: [{
    taskId: 'easy/sum', modelId: 'claude-haiku-4-5', promptConfigId: 'minimal',
    samples: [{ code: 'x', passed: true, timedOut: false }],
    n: 1, c: 1, inputTokens: 10, outputTokens: 20, costUsd: 0.5,
    ttftMs: 0, totalMs: 100, temperature: 0,
  }],
};

test('report includes model leaderboard with pass@1', () => {
  const out = renderReport(artifact);
  expect(out).toContain('claude-haiku-4-5');
  expect(out).toMatch(/pass@1/i);
});

test('report includes prompt leaderboard and matrix', () => {
  const out = renderReport(artifact);
  expect(out).toContain('minimal');
  expect(out).toMatch(/matrix/i);
});
