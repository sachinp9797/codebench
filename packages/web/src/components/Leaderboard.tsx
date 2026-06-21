import { aggregateByModel, type RunArtifact } from '@codebench/core';

const fmt = (n: number, digits: number) => (Number.isFinite(n) ? n.toFixed(digits) : '∞');

export function Leaderboard({ artifact }: { artifact: RunArtifact }) {
  const rows = aggregateByModel(artifact.results).sort((a, b) => b.passAt1 - a.passAt1);
  return (
    <table className="lb">
      <thead>
        <tr>
          <th>Model</th>
          <th>pass@1</th>
          <th>cost/pass</th>
          <th>tok/correct</th>
          <th>avg ms</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.modelId}>
            <td className="model">{r.modelId}</td>
            <td>
              <span className="pass">{(r.passAt1 * 100).toFixed(1)}%</span>{' '}
              <span className="sem">±{(r.passAt1Sem * 100).toFixed(1)}</span>
            </td>
            <td className="dim">${fmt(r.costOfPass, 4)}</td>
            <td className="dim">{fmt(r.tokensPerCorrect, 0)}</td>
            <td className="dim">{r.avgTotalMs.toFixed(0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
