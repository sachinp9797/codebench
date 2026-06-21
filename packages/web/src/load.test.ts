import { expect, test } from 'vitest';
import { parseArtifact } from './load.js';

test('parseArtifact validates a RunArtifact', () => {
  const a = parseArtifact({
    runId: 'r', startedAt: 't', pricingVersion: 'v', tasks: [],
    models: [], promptConfigs: [], results: [],
  });
  expect(a.runId).toBe('r');
});

test('parseArtifact throws on garbage', () => {
  expect(() => parseArtifact({ nope: true })).toThrow();
});
