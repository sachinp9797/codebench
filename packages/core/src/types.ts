import { z } from 'zod';

export const BenchTaskSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  canonicalSolution: z.string(),
  test: z.string(),
  entryPoint: z.string(),
  language: z.literal('typescript'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  releaseDate: z.string(),
  tags: z.array(z.string()).optional(),
});
export type BenchTask = z.infer<typeof BenchTaskSchema>;

export const PromptConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().optional(),
  description: z.string().optional(),
});
export type PromptConfig = z.infer<typeof PromptConfigSchema>;

export const ModelConfigSchema = z.object({
  id: z.string(),
  provider: z.enum(['anthropic', 'openai', 'gemini', 'ollama', 'mock']),
  maxTokens: z.number(),
});
export type ModelConfig = z.infer<typeof ModelConfigSchema>;

export const SampleResultSchema = z.object({
  code: z.string(),
  passed: z.boolean(),
  timedOut: z.boolean(),
  errorKind: z
    .enum(['compile', 'runtime', 'assertion', 'timeout', 'empty'])
    .optional(),
});
export type SampleResult = z.infer<typeof SampleResultSchema>;

export const RunResultSchema = z.object({
  taskId: z.string(),
  modelId: z.string(),
  promptConfigId: z.string(),
  samples: z.array(SampleResultSchema),
  n: z.number(),
  c: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  costUsd: z.number(),
  ttftMs: z.number(),
  totalMs: z.number(),
  temperature: z.number(),
});
export type RunResult = z.infer<typeof RunResultSchema>;

export const RunArtifactSchema = z.object({
  runId: z.string(),
  startedAt: z.string(),
  pricingVersion: z.string(),
  tasks: z.array(z.string()),
  models: z.array(ModelConfigSchema),
  promptConfigs: z.array(PromptConfigSchema),
  results: z.array(RunResultSchema),
});
export type RunArtifact = z.infer<typeof RunArtifactSchema>;
