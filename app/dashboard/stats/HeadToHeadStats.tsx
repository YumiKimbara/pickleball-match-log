"use client";

import { getAvatarUrl } from "@/lib/avatar";

interface HeadToHeadStat {
  opponentId: number;
  opponentName: string;
  opponentPhotoUrl: string | null;
  opponentEmail: string | null;
  wins: number;
  losses: number;
  winRate: number;
  avgScoreDiff: number;
}

interface Props {
  data: HeadToHeadStat[];
}

export default function HeadToHeadStats({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No opponent data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((stat) => {
        const avatarUrl = getAvatarUrl(stat.opponentPhotoUrl, stat.opponentName, stat.opponentEmail);
        
        return (
        <div
          key={`${stat.opponentId}`}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <img
              src={avatarUrl}
              alt={stat.opponentName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{stat.opponentName}</h3>
              <p className="text-sm text-gray-600">
                {stat.wins}W - {stat.losses}L
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-blue-600">
                {stat.winRate}%
              </div>
              <div className="text-gray-600">Win Rate</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div
                className={`text-lg font-bold ${
                  stat.avgScoreDiff > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.avgScoreDiff > 0 ? "+" : ""}
                {stat.avgScoreDiff}
              </div>
              <div className="text-gray-600">Avg Score Diff</div>
            </div>
          </div>
        </div>
      )})}
    </div>
  );
}

