import type { BenchTask } from './types.js';

export interface GenerateOptions {
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  ttftMs: number;
  totalMs: number;
}

export interface Provider {
  readonly id: string;
  generate(prompt: string, opts: GenerateOptions): Promise<GenerateResult>;
}

export interface ExecResult {
  passed: boolean;
  timedOut: boolean;
  errorKind?: 'compile' | 'runtime' | 'assertion' | 'timeout' | 'empty';
  stderr: string;
}

export interface Executor {
  readonly id: string;
  run(code: string, test: string): Promise<ExecResult>;
}

export interface Extractor {
  extract(text: string): string;
}

export interface TaskLoader {
  load(): Promise<BenchTask[]>;
}
