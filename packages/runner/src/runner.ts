import {
  cost, PRICING_VERSION,
  type Provider, type Executor, type Extractor,
  type BenchTask, type PromptConfig, type ModelConfig,
  type RunResult, type RunArtifact, type SampleResult,
} from '@codebench/core';
import { createProvider } from '@codebench/providers';

export interface RunConfig {
  tasks: BenchTask[];
  models: ModelConfig[];
  promptConfigs: PromptConfig[];
  executor: Executor;
  extractor: Extractor;
  samples: number;
  makeProvider?: (model: ModelConfig) => Provider;
  now: () => string;
  runId: string;
  onResult?: (r: RunResult) => void;
}

export async function runBenchmark(config: RunConfig): Promise<RunArtifact> {
  const makeProvider = config.makeProvider ?? createProvider;
  const results: RunResult[] = [];

  for (const model of config.models) {
    const provider = makeProvider(model);
    for (const pc of config.promptConfigs) {
      for (const task of config.tasks) {
        const samples: SampleResult[] = [];
        let inputTokens = 0, outputTokens = 0, ttftMs = 0, totalMs = 0;

        for (let i = 0; i < config.samples; i++) {
          const gen = await provider.generate(task.prompt, {
            systemPrompt: pc.systemPrompt,
            temperature: pc.temperature,
            maxTokens: model.maxTokens,
          });
          inputTokens += gen.inputTokens;
          outputTokens += gen.outputTokens;
          ttftMs += gen.ttftMs;
          totalMs += gen.totalMs;

          const code = config.extractor.extract(gen.text);
          if (!code) {
            samples.push({ code: '', passed: false, timedOut: false, errorKind: 'empty' });
            continue;
          }
          const exec = await config.executor.run(code, task.test);
          samples.push({
            code, passed: exec.passed, timedOut: exec.timedOut, errorKind: exec.errorKind,
          });
        }

        const c = samples.filter((s) => s.passed).length;
        const row: RunResult = {
          taskId: task.id, modelId: model.id, promptConfigId: pc.id,
          samples, n: config.samples, c,
          inputTokens, outputTokens,
          costUsd: cost(model.id, inputTokens, outputTokens),
          ttftMs, totalMs, temperature: pc.temperature ?? 0,
        };
        results.push(row);
        config.onResult?.(row);
      }
    }
  }

  return {
    runId: config.runId,
    startedAt: config.now(),
    pricingVersion: PRICING_VERSION,
    tasks: config.tasks.map((t) => t.id),
    models: config.models,
    promptConfigs: config.promptConfigs,
    results,
  };
}
