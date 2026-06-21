import type { ExecResult } from '@codebench/core';

export function classify(stderr: string): ExecResult['errorKind'] {
  if (stderr.includes('__FAIL__')) return 'assertion';
  if (/SyntaxError|TS\d{4}|is not assignable/.test(stderr)) return 'compile';
  return 'runtime';
}
