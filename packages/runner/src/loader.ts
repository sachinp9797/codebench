import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BenchTaskSchema,
  PromptConfigSchema,
  type TaskLoader,
  type BenchTask,
  type PromptConfig,
} from '@codebench/core';

async function readJsonFiles(dir: string): Promise<unknown[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: unknown[] = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await readJsonFiles(full)));
    else if (e.name.endsWith('.json')) out.push(JSON.parse(await readFile(full, 'utf8')));
  }
  return out;
}

export function createJsonTaskLoader(dir: string): TaskLoader {
  return {
    async load(): Promise<BenchTask[]> {
      const raw = await readJsonFiles(dir);
      return raw.map((r) => BenchTaskSchema.parse(r));
    },
  };
}

export async function loadPromptConfigs(dir: string): Promise<PromptConfig[]> {
  const raw = await readJsonFiles(dir);
  return raw.map((r) => PromptConfigSchema.parse(r));
}
