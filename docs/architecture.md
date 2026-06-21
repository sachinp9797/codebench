# Architecture

CodeBench is a ports-and-adapters (hexagonal) monorepo. The domain lives in `core` as pure TypeScript with no I/O. Everything that touches the outside world — model APIs, Docker, the filesystem — is an adapter that implements a port defined in `core`. The CLI wires concrete adapters at the edge; the UI reads only the output artifact.

## Package map

```
packages/
├── core/          ← pure domain: types, scorer, pricing, port interfaces
├── providers/     ← adapters: one file per provider + registry
├── executor/      ← adapters: Docker (dockerode) + Subprocess
├── extractor/     ← adapter: layered code-fence extraction
├── runner/        ← orchestration: drives ports via dependency injection
├── cli/           ← edge: wires concrete impls, writes RunArtifact
└── web/           ← pure reader: React UI, reads RunArtifact JSON only
```

## Core — the pure domain

`packages/core` contains everything that has no dependency on the outside world:

- **`types.ts`** — Zod-validated schemas for `BenchTask`, `PromptConfig`, `ModelConfig`, `SampleResult`, `RunResult`, and `RunArtifact`. `RunArtifact` JSON is the sole contract between the engine and the UI.
- **`scorer.ts`** — Pure functions: `passAtK` (unbiased Codex estimator), `costOfPass`, `tokensPerCorrect`, `aggregateByModel`, `aggregateByPrompt`, `matrix`. No side effects; fast unit-testable without mocking.
- **`pricing.ts`** — Single pricing table keyed by model id (`inputPerM`/`outputPerM` USD per 1M tokens), `PRICING_VERSION` date stamp, and a `cost()` function that throws on unknown model ids (silent \$0 would corrupt benchmark numbers).
- **`interfaces.ts`** — The four ports:

```ts
interface Provider   { generate(prompt: string, opts: GenerateOptions): Promise<GenerateResult> }
interface Executor   { run(code: string, test: string): Promise<ExecResult> }
interface Extractor  { extract(text: string): string }
interface TaskLoader { load(): Promise<BenchTask[]> }
```

`core` has **no dependencies on any other `@codebench/*` package** and no runtime deps beyond `zod`.

## Adapters

Each adapter implements exactly one port and lives in its own package:

**`providers/`** — one file per provider (`anthropic.ts`, `openai.ts`, `gemini.ts`, `ollama.ts`, `mock.ts`) plus a `registry.ts` that maps `provider:modelId` strings to `Provider` instances. Adding a new provider is one file + one registry entry.

**`executor/`** — `subprocessExecutor` runs generated TypeScript in a child process via `tsx`; `createDockerExecutor` runs it in a locked-down container via `dockerode`. Both return `{ passed, timedOut, errorKind }`. The subprocess executor is the CI fallback (no Docker daemon required).

**`extractor/`** — Layered extraction: tries fenced ` ```ts ` → raw TypeScript → empty string (which scores as a failed sample with `errorKind: "empty"`).

**`runner/`** — Exports `runBenchmark(config: RunConfig)` function that orchestrates the `task × model × promptConfig` loop. The config object carries `executor`, `extractor`, and optional `makeProvider` factory (defaulting to `createProvider`); the runner constructs one `Provider` per model. Tasks are pre-loaded by the CLI and passed in the config array. Returns the completed `RunArtifact`. The CLI writes it to disk once at the end of a run; `onResult` streams progress to stdout.

## CLI — the composition root

`packages/cli` is the only place that imports concrete adapters and wires them together. It resolves `--models` and `--executor` flags into instances, passes them to `runBenchmark`, and has no business logic of its own. This is the "edge" in hexagonal architecture.

## Web — read-only viewer

`packages/web` is a React + Vite app that reads `RunArtifact` JSON and renders the leaderboard (both pivots), model × prompt matrix, and accuracy-vs-cost chart. It has **no dependency on `providers`, `executor`, `runner`, or `extractor`** — only on `@codebench/core` for the shared types. It cannot trigger a run.

## Dependency rule

```
web  →  core
cli  →  runner → executor, extractor, providers, core
            ↘  core
```

`core` imports nothing internal. `web` imports only `@codebench/core`. Everything else may import `core` but not `web`.

This rule is enforced at two levels:

1. **Workspace boundaries** — `packages/web/package.json` lists only `@codebench/core` as a workspace dependency. A misconfigured import would fail to resolve at runtime.
2. **ESLint** — `eslint.config.js` at the repo root uses `eslint-plugin-import` to make violations a lint error:
   - `import/no-restricted-paths` on `packages/core/**/*.ts` — flags any import sourced from another package under `packages/`.
   - `no-restricted-imports` on `packages/web/**/*.{ts,tsx}` — flags any import matching `@codebench/providers`, `@codebench/executor`, `@codebench/runner`, or `@codebench/extractor`.

Running `pnpm lint` enforces both rules across the monorepo.

## Dev-runs-on-source

All packages set their `exports` to point at `src/index.ts` rather than a compiled `dist/`. `tsx` and `vitest` transpile on the fly; there is no build step during development. `tsc -b` is the typecheck gate (`pnpm typecheck`) — it checks types across the whole project graph without emitting files. This means `pnpm install && pnpm typecheck && pnpm test` is the complete development loop.
