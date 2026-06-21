import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { Executor, ExecResult } from '@codebench/core';
import { buildHarness } from './harness.js';
import { classify } from './classify.js';

const TIMEOUT_MS = 5000;

// Resolve tsx binary from this package's node_modules to avoid npx overhead
// and ensure SIGKILL reaches the actual process (npx spawns a child that npx kill doesn't terminate).
const __dirname = dirname(fileURLToPath(import.meta.url));
const TSX_BIN = resolve(__dirname, '../node_modules/.bin/tsx');

export const subprocessExecutor: Executor = {
  id: 'subprocess',
  async run(code: string, test: string): Promise<ExecResult> {
    const nonce = randomUUID();
    const dir = await mkdtemp(join(tmpdir(), 'codebench-'));
    const file = join(dir, 'harness.ts');
    await writeFile(file, buildHarness(code, test, nonce));
    try {
      return await new Promise<ExecResult>((resolve) => {
        // Spawn tsx directly (not via npx) so SIGKILL reliably terminates the process.
        const child = spawn(TSX_BIN, [file], { cwd: dir });
        let stderr = '';
        let stdout = '';
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          child.kill('SIGKILL');
        }, TIMEOUT_MS);
        child.stdout.on('data', (d: Buffer) => (stdout += d.toString()));
        child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
        // Use 'exit' instead of 'close': tsx uses worker threads that keep
        // stdio open after SIGKILL, so 'close' never fires for killed processes.
        child.on('exit', (codeExit: number | null) => {
          clearTimeout(timer);
          if (timedOut) return resolve({ passed: false, timedOut: true, errorKind: 'timeout', stderr });
          const passed = codeExit === 0 && stdout.includes('__PASS__' + nonce);
          resolve({
            passed,
            timedOut: false,
            errorKind: passed ? undefined : classify(stderr),
            stderr,
          });
        });
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
};
