import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";

// Mock data for demo
const mockUser = {
  id: 1,
  name: "Yumi Kimbara",
  email: "yumi@example.com",
  role: 'admin' as const,
  elo: 1532,
};

const mockOpponents = [
  { id: 1, name: "John Smith", email: "john@example.com", photo_url: null, elo: 1485 },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", photo_url: null, elo: 1550 },
  { id: 3, name: "Mike Chen", email: null, photo_url: null, elo: 1420 },
];

const mockMatches = [
  {
    id: 1,
    player_a_id: 1,
    player_a_type: 'user' as const,
    player_b_id: 1,
    player_b_type: 'opponent' as const,
    score_a: 11,
    score_b: 8,
    winner_id: 1,
    winner_type: 'user' as const,
    elo_change_a: 16,
    elo_change_b: -16,
    played_at: new Date('2025-01-15'),
  },
  {
    id: 2,
    player_a_id: 1,
    player_a_type: 'user' as const,
    player_b_id: 2,
    player_b_type: 'opponent' as const,
    score_a: 9,
    score_b: 11,
    winner_id: 2,
    winner_type: 'opponent' as const,
    elo_change_a: -18,
    elo_change_b: 18,
    played_at: new Date('2025-01-14'),
  },
  {
    id: 3,
    player_a_id: 1,
    player_a_type: 'user' as const,
    player_b_id: 3,
    player_b_type: 'opponent' as const,
    score_a: 11,
    score_b: 5,
    winner_id: 1,
    winner_type: 'user' as const,
    elo_change_a: 14,
    elo_change_b: -14,
    played_at: new Date('2025-01-13'),
  },
];

export default function DemoPage() {
  const wins = mockMatches.filter(m => m.winner_type === "user").length;
  const total = mockMatches.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Demo Banner */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6">
          <h2 className="font-bold text-yellow-900 mb-2">🎮 Demo Mode</h2>
          <p className="text-sm text-yellow-800">
            This is a demo with mock data. No authentication or database required!
          </p>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {mockUser.name}!
          </p>
          <p className="text-gray-600">ELO: {Math.round(mockUser.elo)}</p>
          <p className="text-sm text-gray-500">Role: {mockUser.role}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{wins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{total - wins}</div>
            <div className="text-sm text-gray-600">Losses</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/demo/match"
            className="h-24 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:bg-green-700"
          >
            + New Match (Demo)
          </Link>
          <Link
            href="/demo/opponents"
            className="h-24 bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-700"
          >
            Opponents (Demo)
          </Link>
        </div>

        {/* Recent Matches */}
        <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
        <div className="space-y-3">
          {mockMatches.map((match) => {
            const won = match.winner_type === "user";
            const opponent = mockOpponents.find(o => o.id === match.player_b_id);

            return (
              <div
                key={match.id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  won ? "border-green-600" : "border-red-600"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {won ? "Won" : "Lost"} {match.score_a}-{match.score_b}
                    </div>
                    <div className="text-sm text-gray-600">
                      vs {opponent?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-600">
                      ELO {match.elo_change_a > 0 ? "+" : ""}
                      {match.elo_change_a}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.played_at.toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Opponents Section */}
        <h2 className="text-xl font-bold mb-4 mt-8">Your Opponents</h2>
        <div className="space-y-3">
          {mockOpponents.map((opponent) => (
            <div key={opponent.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <img
                src={getAvatarUrl(opponent.photo_url, opponent.name, opponent.email)}
                alt={opponent.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{opponent.name}</h3>
                {opponent.email && (
                  <p className="text-sm text-gray-600">{opponent.email}</p>
                )}
                <p className="text-sm text-gray-500">ELO: {Math.round(opponent.elo)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📚 What You're Seeing</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✅ Dashboard with stats (wins, losses, win rate)</li>
            <li>✅ Match history with ELO changes</li>
            <li>✅ Opponent management with deterministic avatars</li>
            <li>✅ Mobile-first responsive design</li>
            <li>✅ One-handed match logging UI (click "New Match")</li>
          </ul>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-900 font-semibold mb-2">To enable full features:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Set up Vercel Postgres database</li>
              <li>Configure Google OAuth (optional)</li>
              <li>Add Resend for magic links (optional)</li>
              <li>Set up Vercel Blob for photo uploads</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
