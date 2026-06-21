/**
 * Assemble a single runnable TS program: the model's solution, a minimal
 * assert helper, and the task's test code. Strips `export` so symbols are
 * top-level and callable by the tests. Exit code 0 = pass, non-zero = fail.
 *
 * nonce: a random per-run UUID. The PASS sentinel is `__PASS__${nonce}` so a
 * model solution cannot pre-print it (it can't know the nonce in advance).
 * The __ran flag ensures the test block actually ran to completion.
 */
export function buildHarness(code: string, test: string, nonce: string): string {
  const solution = code.replace(/^\s*export\s+/gm, '');
  return `
function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg ?? 'assertion failed');
}
${solution}
let __ran = false;
try {
${test}
  __ran = true;
} catch (e) {
  console.error('__FAIL__', (e as Error).message);
  process.exit(1);
}
if (__ran) console.log('__PASS__` + nonce + `');
`;
}
