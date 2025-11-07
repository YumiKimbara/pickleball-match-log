import { requireAuth } from "@/lib/auth-guards";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import RecentMatches from "./RecentMatches";

async function handleSignOut() {
  'use server'
  await signOut({ redirectTo: '/auth/signin' });
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const matches = await db.getMatchesByPlayer(session.user.id, "user");
  const inProgress = await db.getInProgressMatch(session.user.id);
  
  // Get fresh user data for current ELO
  const currentUser = await db.getUserById(session.user.id);
  const currentElo = currentUser?.elo || session.user.elo;

  const wins = matches.filter(
    (m) => m.winner_id === session.user.id && m.winner_type === "user"
  ).length;
  const total = matches.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-red-600 underline"
              >
                Sign Out
              </button>
            </form>
          </div>
          <p className="text-gray-600">
            Welcome, {session.user.name || session.user.email}!
          </p>
          <p className="text-gray-600">ELO: {Math.round(Number(currentElo))}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Role: {session.user.role}</p>
            {session.user.role === 'admin' && (
              <Link 
                href="/dashboard/admin" 
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Admin Panel
              </Link>
            )}
          </div>
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
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link
            href="/dashboard/match/new"
            className="h-24 bg-green-600 text-white rounded-xl font-bold text-base flex items-center justify-center hover:bg-green-700"
          >
            + New Match
          </Link>
          <Link
            href="/dashboard/opponents"
            className="h-24 bg-blue-600 text-white rounded-xl font-bold text-base flex items-center justify-center hover:bg-blue-700"
          >
            Opponents
          </Link>
          <Link
            href="/dashboard/stats"
            className="h-24 bg-purple-600 text-white rounded-xl font-bold text-base flex items-center justify-center hover:bg-purple-700"
          >
            Stats
          </Link>
        </div>

        {/* Recent Matches */}
        <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
        <RecentMatches matches={matches} userId={session.user.id} />
      </div>
    </div>
  );
}
