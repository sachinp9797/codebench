import { RunArtifactSchema, type RunArtifact } from '@codebench/core';

export function parseArtifact(raw: unknown): RunArtifact {
  return RunArtifactSchema.parse(raw);
}

export async function fetchArtifact(url: string): Promise<RunArtifact> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load artifact: ${res.status}`);
  return parseArtifact(await res.json());
}
