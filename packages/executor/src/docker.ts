import Docker from 'dockerode';
import { PassThrough } from 'node:stream';
import { randomUUID } from 'node:crypto';
import type { Executor, ExecResult } from '@codebench/core';
import { buildHarness } from './harness.js';
import { classify } from './classify.js';

const IMAGE = 'codebench-sandbox:latest';
const TIMEOUT_MS = 10000;

export interface DockerExecutorOptions {
  image?: string;
  runtime?: string; // e.g. "runsc" for gVisor hardening
}

export function createDockerExecutor(opts: DockerExecutorOptions = {}): Executor {
  const docker = new Docker();
  const image = opts.image ?? IMAGE;
  return {
    id: 'docker',
    async run(code: string, test: string): Promise<ExecResult> {
      const nonce = randomUUID();
      const harness = buildHarness(code, test, nonce);
      // Pass the harness via base64 heredoc to avoid shell escaping issues.
      const b64 = Buffer.from(harness).toString('base64');
      const container = await docker.createContainer({
        Image: image,
        User: '1000:1000',
        Tty: false,
        Entrypoint: ['sh', '-c'],
        Cmd: [`echo ${b64} | base64 -d > /tmp/harness.ts && tsx /tmp/harness.ts`],
        HostConfig: {
          NetworkMode: 'none',
          Memory: 256 * 1024 * 1024,
          MemorySwap: 256 * 1024 * 1024,
          NanoCpus: 500_000_000,
          PidsLimit: 128,
          ReadonlyRootfs: true,
          AutoRemove: true,
          CapDrop: ['ALL'],
          SecurityOpt: ['no-new-privileges:true'],
          // noexec removed: esbuild (used by tsx) extracts and execs a native binary
          // under HOME/.cache; all other hardening flags remain intact.
          Tmpfs: { '/tmp': 'rw,nosuid,size=64m' },
          ...(opts.runtime ? { Runtime: opts.runtime } : {}),
        },
      });

      const stdoutStream = new PassThrough();
      const stderrStream = new PassThrough();
      let out = '';
      let err = '';
      stdoutStream.on('data', (c: Buffer) => (out += c.toString()));
      stderrStream.on('data', (c: Buffer) => (err += c.toString()));
      const stream = await container.attach({ stream: true, stdout: true, stderr: true });
      container.modem.demuxStream(stream, stdoutStream, stderrStream);

      await container.start();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        container.kill({ signal: 'SIGKILL' }).catch(() => {});
      }, TIMEOUT_MS);
      const result = await container.wait();
      clearTimeout(timer);

      if (timedOut) return { passed: false, timedOut: true, errorKind: 'timeout', stderr: err };
      const passed = result.StatusCode === 0 && out.includes('__PASS__' + nonce);
      return { passed, timedOut: false, errorKind: passed ? undefined : classify(err), stderr: err };
    },
  };
}
