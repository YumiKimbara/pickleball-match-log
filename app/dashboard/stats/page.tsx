import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import EloChart from "./EloChart";
import WinRateChart from "./WinRateChart";
import HeadToHeadStats from "./HeadToHeadStats";
import Link from "next/link";

const STARTING_ELO = 1500;

export default async function StatsPage() {
  const session = await requireAuth();
  const allMatchesDesc = await db.getMatchesByPlayer(session.user.id, "user");
  
  // Get current user data for actual ELO
  const currentUser = await db.getUserById(session.user.id);
  const actualCurrentElo = currentUser?.elo || session.user.elo;
  
  // Reverse to get oldest first for cumulative calculations
  const allMatches = [...allMatchesDesc].reverse();

  // Calculate ELO history - use database ELO as final value (source of truth)
  const dbElo = Math.round(Number(actualCurrentElo));
  let calculatedElo = STARTING_ELO;
  const eloHistory = [];
  
  // Calculate cumulative ELO from match changes
  for (let index = 0; index < allMatches.length; index++) {
    const match = allMatches[index];
    const isUserPlayerA = match.player_a_type === "user" && match.player_a_id === session.user.id;
    
    const eloChangeRaw = isUserPlayerA ? match.elo_change_a : match.elo_change_b;
    const eloChange = typeof eloChangeRaw === 'number' 
      ? eloChangeRaw 
      : (typeof eloChangeRaw === 'string' ? parseFloat(eloChangeRaw) : 0);
    
    calculatedElo += eloChange;

    eloHistory.push({
      date: new Date(match.played_at).toLocaleDateString(),
      elo: Math.round(calculatedElo),
      matchNumber: index + 1,
    });
  }
  
  // Adjust final ELO to match database (correct any historical discrepancies)
  if (eloHistory.length > 0 && eloHistory[eloHistory.length - 1].elo !== dbElo) {
    eloHistory[eloHistory.length - 1].elo = dbElo;
  }

  // Calculate win rate trends
  const groupedByDate = allMatches.reduce((acc, match) => {
    const date = new Date(match.played_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { wins: 0, total: 0 };
    }
    acc[date].total++;
    if (match.winner_id === session.user.id && match.winner_type === "user") {
      acc[date].wins++;
    }
    return acc;
  }, {} as Record<string, { wins: number; total: number }>);

  const winRateHistory = Object.entries(groupedByDate).map(([date, stats]) => ({
    date,
    winRate: Math.round((stats.wins / stats.total) * 100),
    wins: stats.wins,
    losses: stats.total - stats.wins,
  }));

  // Calculate head-to-head stats
  const opponentStats = allMatches.reduce((acc, match) => {
    const isUserPlayerA = match.player_a_type === "user" && match.player_a_id === session.user.id;
    const opponentId = isUserPlayerA ? match.player_b_id : match.player_a_id;
    const opponentType = isUserPlayerA ? match.player_b_type : match.player_a_type;
    const key = `${opponentType}-${opponentId}`;

    if (!acc[key]) {
      acc[key] = {
        opponentId,
        opponentType,
        wins: 0,
        losses: 0,
        totalScore: 0,
        matches: 0,
      };
    }

    const won = match.winner_id === session.user.id && match.winner_type === "user";
    if (won) {
      acc[key].wins++;
    } else {
      acc[key].losses++;
    }

    const userScore = isUserPlayerA ? match.score_a : match.score_b;
    const oppScore = isUserPlayerA ? match.score_b : match.score_a;
    acc[key].totalScore += userScore - oppScore;
    acc[key].matches++;

    return acc;
  }, {} as Record<string, any>);

  const headToHeadData = await Promise.all(
    Object.values(opponentStats).map(async (stat: any) => {
      let opponent;
      if (stat.opponentType === "opponent") {
        opponent = await db.getOpponentById(stat.opponentId);
      } else {
        opponent = await db.getUserById(stat.opponentId);
      }

      return {
        opponentId: stat.opponentId,
        opponentName: opponent?.name || "Unknown",
        opponentPhotoUrl: opponent?.photo_url || null,
        opponentEmail: opponent?.email || null,
        wins: stat.wins,
        losses: stat.losses,
        winRate: Math.round((stat.wins / (stat.wins + stat.losses)) * 100),
        avgScoreDiff: Math.round(stat.totalScore / stat.matches),
      };
    })
  );

  headToHeadData.sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">Statistics</h1>
        </div>

        {allMatches.length < 2 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Play at least 2 matches to see statistics.
          </div>
        ) : (
          <div className="space-y-6">
            {/* ELO Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">ELO Rating Over Time</h2>
              <EloChart data={eloHistory} />
            </div>

            {/* Win Rate Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Win Rate Trend</h2>
              <WinRateChart data={winRateHistory} />
            </div>

            {/* Head-to-Head Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Head-to-Head Records</h2>
              <HeadToHeadStats data={headToHeadData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

