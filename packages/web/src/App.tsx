import { useEffect, useState } from 'react';
import type { RunArtifact } from '@codebench/core';
import { fetchArtifact } from './load.js';
import { Leaderboard } from './components/Leaderboard.js';
import { Matrix } from './components/Matrix.js';
import { CostChart } from './components/CostChart.js';

export default function App() {
  const [artifact, setArtifact] = useState<RunArtifact | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchArtifact('/sample-run.json').then(setArtifact).catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="state error">{error}</div>;
  if (!artifact) return <div className="state">Loading run…</div>;

  return (
    <div className="page">
      <header className="masthead">
        <h1>Code<span className="dot">·</span>Bench</h1>
        <span className="run-chip" title={artifact.runId}>{artifact.runId}</span>
        <p className="tagline">
          Correctness, cost-of-pass, tokens, and latency across models × prompt configs.
        </p>
      </header>

      <section className="section">
        <p className="eyebrow">Model leaderboard</p>
        <div className="card">
          <Leaderboard artifact={artifact} />
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Model × prompt pass-rate</p>
        <div className="card">
          <Matrix artifact={artifact} />
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Accuracy vs cost</p>
        <div className="card">
          <div className="chart-wrap">
            <CostChart artifact={artifact} />
          </div>
        </div>
      </section>
    </div>
  );
}
