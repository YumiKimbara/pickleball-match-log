"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface EloDataPoint {
  date: string;
  elo: number;
  matchNumber: number;
}

interface Props {
  data: EloDataPoint[];
}

export default function EloChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="matchNumber"
          label={{ value: "Match #", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "ELO", angle: -90, position: "insideLeft" }}
          domain={["dataMin - 50", "dataMax + 50"]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const eloValue = payload[0].payload.elo;
              return (
                <div className="bg-white border border-gray-300 rounded p-2 shadow">
                  <p className="font-bold">Match #{payload[0].payload.matchNumber}</p>
                  <p className="text-sm">ELO: {Math.round(eloValue)}</p>
                  <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <ReferenceLine y={1500} stroke="#9ca3af" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="elo"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: "#2563eb", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

