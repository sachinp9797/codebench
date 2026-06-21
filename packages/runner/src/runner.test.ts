import { expect, test } from 'vitest';
import { runBenchmark } from './runner.js';
import { fenceExtractor } from '@codebench/extractor';
import { createMockProvider } from '@codebench/providers';
import type { Executor, BenchTask, PromptConfig, ModelConfig } from '@codebench/core';

const task: BenchTask = {
  id: 'easy/sum', prompt: 'sum', canonicalSolution: 'x',
  test: 'assert(true)', entryPoint: 'sum', language: 'typescript',
  difficulty: 'easy', releaseDate: '2026-01-01',
};
const prompt: PromptConfig = { id: 'minimal', label: 'M', systemPrompt: 's', temperature: 0 };
const model: ModelConfig = { id: 'claude-haiku-4-5', provider: 'mock', maxTokens: 100 };

const passExecutor: Executor = {
  id: 'fake', async run() { return { passed: true, timedOut: false, stderr: '' }; },
};

test('runBenchmark produces a valid artifact with one result row', async () => {
  const artifact = await runBenchmark({
    tasks: [task], models: [model], promptConfigs: [prompt],
    executor: passExecutor, extractor: fenceExtractor, samples: 1,
    makeProvider: () => createMockProvider({ response: '```ts\nexport const sum=()=>1;\n```' }),
    now: () => '2026-06-21T00:00:00Z', runId: 'test-run',
  });
  expect(artifact.results).toHaveLength(1);
  expect(artifact.results[0].c).toBe(1);
  expect(artifact.results[0].costUsd).toBeGreaterThan(0);
  expect(artifact.runId).toBe('test-run');
});

test('failed execution => c=0', async () => {
  const failExecutor: Executor = {
    id: 'fail', async run() { return { passed: false, timedOut: false, errorKind: 'assertion', stderr: '' }; },
  };
  const artifact = await runBenchmark({
    tasks: [task], models: [model], promptConfigs: [prompt],
    executor: failExecutor, extractor: fenceExtractor, samples: 2,
    makeProvider: () => createMockProvider({ response: 'code' }),
    now: () => 't', runId: 'r',
  });
  expect(artifact.results[0].n).toBe(2);
  expect(artifact.results[0].c).toBe(0);
});
