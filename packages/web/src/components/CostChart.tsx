import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  CartesianGrid, LabelList, ZAxis,
} from 'recharts';
import { aggregateByModel, type RunArtifact } from '@codebench/core';

export function CostChart({ artifact }: { artifact: RunArtifact }) {
  const data = aggregateByModel(artifact.results).map((m) => ({
    name: m.modelId, x: Number(m.totalCostUsd.toFixed(4)), y: Number((m.passAt1 * 100).toFixed(1)),
  }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 24, right: 32, bottom: 32, left: 8 }}>
        <CartesianGrid stroke="#262b38" />
        <XAxis
          type="number" dataKey="x" name="total cost"
          stroke="#5c6478" tick={{ fontSize: 12 }}
          domain={[0, 'dataMax']}
          tickFormatter={(v) => `$${v}`}
          label={{ value: 'total cost (USD)', position: 'bottom', fill: '#8b93a7', fontSize: 12 }}
        />
        <YAxis
          type="number" dataKey="y" name="pass@1" domain={[0, 100]}
          stroke="#5c6478" tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
          label={{ value: 'pass@1', angle: -90, position: 'insideLeft', fill: '#8b93a7', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#5c6478' }}
          contentStyle={{ background: '#1b1f2a', border: '1px solid #262b38', borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
          labelStyle={{ color: '#e6e9f0' }}
          formatter={(value: number, name: string) =>
            name === 'pass@1' ? [`${value}%`, name] : [`$${value}`, name]}
        />
        <ZAxis range={[260, 260]} />
        <Scatter data={data} fill="#5b9dff" stroke="#0f1117" strokeWidth={2} shape="circle">
          <LabelList dataKey="name" position="top" offset={12} style={{ fill: '#c7cdda', fontSize: 11, fontFamily: 'ui-monospace, monospace' }} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
