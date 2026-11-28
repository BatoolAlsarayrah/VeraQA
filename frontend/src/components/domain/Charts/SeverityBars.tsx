import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useMediaQuery } from '@/hooks/useMediaQuery';

import type { Row } from './rows';

const tick = { fill: 'var(--text-2)', fontSize: 12, fontWeight: 600 };

export function SeverityBars({ rows }: { rows: Row[] }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const top = Math.max(1, ...rows.map((row) => row.value));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <XAxis type="number" hide domain={[0, top]} />
        <YAxis
          yAxisId="label"
          type="category"
          dataKey="label"
          width={64}
          tickLine={false}
          axisLine={false}
          tick={tick}
        />
        <YAxis
          yAxisId="count"
          orientation="right"
          type="category"
          dataKey="value"
          width={28}
          tickLine={false}
          axisLine={false}
          tick={{ ...tick, fill: 'var(--text)' }}
        />
        <Bar
          yAxisId="label"
          dataKey="value"
          barSize={6}
          radius={3}
          background={{ fill: 'var(--neutral-bg)', radius: 3 }}
          isAnimationActive={!still}
        >
          {rows.map((row) => (
            <Cell key={row.label} fill={row.fill} fillOpacity={row.opacity} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
