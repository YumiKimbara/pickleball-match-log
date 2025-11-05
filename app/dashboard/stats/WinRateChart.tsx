"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WinRateDataPoint {
  date: string;
  winRate: number;
  wins: number;
  losses: number;
}

interface Props {
  data: WinRateDataPoint[];
}

export default function WinRateChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          label={{ value: "Win Rate (%)", angle: -90, position: "insideLeft" }}
          domain={[0, 100]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white border border-gray-300 rounded p-2 shadow">
                  <p className="font-bold">{payload[0].payload.date}</p>
                  <p className="text-sm">Win Rate: {payload[0].value}%</p>
                  <p className="text-sm text-gray-600">
                    {payload[0].payload.wins}W - {payload[0].payload.losses}L
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="winRate"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#colorWinRate)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

