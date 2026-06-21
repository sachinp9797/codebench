import { expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createJsonTaskLoader } from './loader.js';
import { subprocessExecutor } from '@codebench/executor';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../');

// Prove every canonicalSolution passes its own adversarial test.
// This ensures the dataset is sound before using it to rank models.
test('all canonical solutions pass their own tests', async () => {
  const loader = createJsonTaskLoader(join(root, 'tasks'));
  const tasks = await loader.load();
  expect(tasks.length).toBeGreaterThan(0);

  const failures: string[] = [];
  for (const task of tasks) {
    const result = await subprocessExecutor.run(task.canonicalSolution, task.test);
    if (!result.passed) {
      failures.push(
        `${task.id}: passed=${result.passed} timedOut=${result.timedOut} kind=${result.errorKind ?? 'none'} stderr=${result.stderr.slice(0, 200)}`,
      );
    }
  }

  if (failures.length > 0) {
    console.error('Failing tasks:\n' + failures.join('\n'));
  }
  expect(failures).toEqual([]);
}, 120_000);
