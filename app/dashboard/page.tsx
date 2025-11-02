import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireAuth();
  const matches = await db.getMatchesByPlayer(session.user.id, "user");
  const inProgress = await db.getInProgressMatch(session.user.id);

  const wins = matches.filter(
    (m) => m.winner_id === session.user.id && m.winner_type === "user"
  ).length;
  const total = matches.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {session.user.name || session.user.email}!
          </p>
          <p className="text-gray-600">ELO: {Math.round(session.user.elo)}</p>
          <p className="text-sm text-gray-500">Role: {session.user.role}</p>
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

        {/* Resume Match Banner */}
        {inProgress && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
            <h3 className="font-bold mb-2">Resume last match?</h3>
            <Link
              href="/dashboard/match/resume"
              className="inline-block h-10 px-6 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700"
            >
              Resume
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/match/new"
            className="h-24 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:bg-green-700"
          >
            + New Match
          </Link>
          <Link
            href="/dashboard/opponents"
            className="h-24 bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-700"
          >
            Opponents
          </Link>
        </div>

        {/* Recent Matches */}
        <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
        {matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No matches yet. Start logging your games!
          </div>
        ) : (
          <div className="space-y-3">
            {matches.slice(0, 10).map((match) => {
              const isUserPlayerA = match.player_a_type === "user" && match.player_a_id === session.user.id;
              const userScore = isUserPlayerA ? match.score_a : match.score_b;
              const oppScore = isUserPlayerA ? match.score_b : match.score_a;
              const won = match.winner_id === session.user.id && match.winner_type === "user";
              const eloChange = isUserPlayerA ? match.elo_change_a : match.elo_change_b;

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
                        {won ? "Won" : "Lost"} {userScore}-{oppScore}
                      </div>
                      <div className="text-sm text-gray-600">
                        ELO {eloChange && eloChange > 0 ? "+" : ""}
                        {eloChange}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(match.played_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
