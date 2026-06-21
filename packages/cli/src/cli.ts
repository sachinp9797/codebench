#!/usr/bin/env node
import { Command } from 'commander';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runBenchmark, createJsonTaskLoader, loadPromptConfigs } from '@codebench/runner';
import { subprocessExecutor, createDockerExecutor } from '@codebench/executor';
import { fenceExtractor } from '@codebench/extractor';
import { RunArtifactSchema, type ModelConfig } from '@codebench/core';
import { renderReport } from './report.js';

// Repo root is three levels up from packages/cli/src/cli.ts
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

const program = new Command();
program.name('codebench').version('0.1.0');

program
  .command('run')
  .description('run the benchmark')
  .requiredOption('--models <ids>', 'comma-separated model specs provider:id (e.g. mock:m1,anthropic:claude-haiku-4-5)')
  .option('--tasks <dir>', 'tasks dir', join(repoRoot, 'tasks'))
  .option('--prompts <dir>', 'prompts dir', join(repoRoot, 'prompts'))
  .option('--samples <n>', 'samples per cell', '1')
  .option('--executor <kind>', 'docker | subprocess', 'subprocess')
  .option('--out <dir>', 'results dir', join(repoRoot, 'results'))
  .action(async (opts) => {
    const models: ModelConfig[] = String(opts.models).split(',').map((spec) => {
      const [provider, ...rest] = spec.split(':');
      const id = provider === 'ollama' || provider === 'mock' ? spec : rest.join(':');
      return { id, provider: provider as ModelConfig['provider'], maxTokens: 4096 };
    });
    const tasks = await createJsonTaskLoader(opts.tasks).load();
    const promptConfigs = await loadPromptConfigs(opts.prompts);
    const executor = opts.executor === 'docker' ? createDockerExecutor() : subprocessExecutor;
    const runId = `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;

    const artifact = await runBenchmark({
      tasks, models, promptConfigs, executor, extractor: fenceExtractor,
      samples: Number(opts.samples),
      now: () => new Date().toISOString(), runId,
      onResult: (r) => console.log(`  ${r.modelId}/${r.promptConfigId}/${r.taskId}: ${r.c}/${r.n}`),
    });

    await mkdir(opts.out, { recursive: true });
    const file = join(opts.out, `${runId}.json`);
    await writeFile(file, JSON.stringify(artifact, null, 2));
    console.log(`\nWrote ${file}`);
    console.log(renderReport(artifact));
  });

program
  .command('report')
  .description('print leaderboards for a result file')
  .argument('<file>', 'path to results json')
  .action(async (file) => {
    const artifact = RunArtifactSchema.parse(JSON.parse(await readFile(file, 'utf8')));
    console.log(renderReport(artifact));
  });

program.parseAsync();
