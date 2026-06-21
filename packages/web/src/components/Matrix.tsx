import { matrix, type RunArtifact } from '@codebench/core';

// Continuous pass-rate scale: dim slate at 0% → saturated green at 100%.
// Text flips to dark once the cell is bright enough to keep contrast.
function cellStyle(v: number): React.CSSProperties {
  const alpha = 0.12 + v * 0.78;
  return {
    background: `rgba(52, 211, 153, ${alpha})`,
    color: v > 0.55 ? '#0c1a13' : 'var(--ink)',
  };
}

export function Matrix({ artifact }: { artifact: RunArtifact }) {
  const cells = matrix(artifact.results);
  const models = [...new Set(cells.map((c) => c.modelId))];
  const prompts = [...new Set(cells.map((c) => c.promptConfigId))];
  const get = (m: string, p: string) =>
    cells.find((c) => c.modelId === m && c.promptConfigId === p)?.passAt1 ?? 0;

  return (
    <table className="matrix">
      <thead>
        <tr>
          <th></th>
          {prompts.map((p) => (
            <th key={p}>{p}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {models.map((m) => (
          <tr key={m}>
            <td className="rowlabel">{m}</td>
            {prompts.map((p) => {
              const v = get(m, p);
              return (
                <td key={p}>
                  <div className="cell" style={cellStyle(v)}>
                    {(v * 100).toFixed(0)}%
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
