import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { DashboardData, Timeframe } from '../types/salesos';

interface DecisionChartsProps {
  salesTrend: DashboardData['salesTrend'];
  channelGrowth: Array<{ channel: string; growth: number }>;
  timeframe: Timeframe;
}

export function DecisionCharts({ salesTrend, channelGrowth, timeframe }: DecisionChartsProps) {
  return (
    <>
      <article className="decision-panel panel-surface">
        <div className="panel-headline">
          <h3>Sales Trajectory</h3>
          <p>Actual vs target momentum ({timeframe}).</p>
        </div>
        <div className="chart-wrap compact">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf5" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="target" stroke="#1d4ed8" strokeWidth={2.3} dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#0f766e" strokeWidth={2.6} />
              <Line
                type="monotone"
                dataKey="lastYear"
                stroke="#64748b"
                strokeWidth={1.7}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="decision-panel panel-surface">
        <div className="panel-headline">
          <h3>Channel Growth Lens</h3>
          <p>Where incremental growth is strongest now.</p>
        </div>
        <div className="chart-wrap compact">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelGrowth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf5" />
              <XAxis dataKey="channel" interval={0} angle={-10} textAnchor="end" height={42} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="growth" fill="#ea580c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </>
  );
}

