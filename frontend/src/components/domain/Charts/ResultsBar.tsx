import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useMediaQuery } from '@/hooks/useMediaQuery';

import type { Row } from './rows';

export function ResultsBar({ rows }: { rows: Row[] }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const total = Math.max(
    1,
    rows.reduce((sum, row) => sum + row.value, 0),
  );
  const data = [Object.fromEntries(rows.map((row) => [row.label, row.value]))];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <XAxis type="number" hide domain={[0, total]} />
        <YAxis type="category" hide />
        {rows.map((row) => (
          <Bar
            key={row.label}
            dataKey={row.label}
            stackId="results"
            fill={row.fill}
            barSize={8}
            isAnimationActive={!still}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
