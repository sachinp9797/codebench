import { expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createJsonTaskLoader, loadPromptConfigs } from './loader.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../');

test('loads and validates tasks from a directory tree', async () => {
  const loader = createJsonTaskLoader(join(root, 'tasks'));
  const tasks = await loader.load();
  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks.every((t) => t.language === 'typescript')).toBe(true);
});

test('loads prompt configs', async () => {
  const prompts = await loadPromptConfigs(join(root, 'prompts'));
  expect(prompts.find((p) => p.id === 'minimal')).toBeTruthy();
});
