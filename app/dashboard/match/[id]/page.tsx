import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const matchId = parseInt(id);
  
  const match = await db.getMatchById(matchId);
  
  if (!match) {
    notFound();
  }

  // Get player names
  const isUserPlayerA = match.player_a_type === "user" && match.player_a_id === session.user.id;
  const userScore = isUserPlayerA ? match.score_a : match.score_b;
  const oppScore = isUserPlayerA ? match.score_b : match.score_a;
  const won = match.winner_id === session.user.id && match.winner_type === "user";
  const eloChange = isUserPlayerA ? match.elo_change_a : match.elo_change_b;

  // Get opponent info
  const opponentId = isUserPlayerA ? match.player_b_id : match.player_a_id;
  const opponentType = isUserPlayerA ? match.player_b_type : match.player_a_type;
  
  let opponentName = "Unknown";
  if (opponentType === "opponent") {
    const opp = await db.getOpponentById(opponentId);
    opponentName = opp?.name || "Unknown";
  } else {
    const usr = await db.getUserById(opponentId);
    opponentName = usr?.name || "Unknown";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-2">Match Details</h1>
        </div>

        {/* Match Result Card */}
        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 mb-6 ${
          won ? "border-green-600" : "border-red-600"
        }`}>
          <div className="text-center mb-4">
            <h2 className={`text-4xl font-bold mb-2 ${won ? "text-green-600" : "text-red-600"}`}>
              {won ? "Victory" : "Defeat"}
            </h2>
            <p className="text-5xl font-bold text-gray-800">
              {userScore} - {oppScore}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center mt-6">
            <div>
              <p className="text-sm text-gray-600">You</p>
              <p className="text-lg font-semibold">{session.user.name || session.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Opponent</p>
              <p className="text-lg font-semibold">{opponentName}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">ELO Change</p>
              <p className={`text-2xl font-bold ${eloChange && eloChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {eloChange && eloChange > 0 ? "+" : ""}{eloChange}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Play To</p>
              <p className="text-2xl font-bold text-gray-800">{match.play_to}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(match.played_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Match Photo</h3>
          
          {match.photo_url ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={match.photo_url}
                  alt="Match photo"
                  fill
                  className="object-cover"
                />
              </div>
              <Link
                href={`/dashboard/match/${matchId}/photo`}
                className="block w-full h-12 bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-300"
              >
                Change Photo
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No photo added yet</p>
              <Link
                href={`/dashboard/match/${matchId}/photo`}
                className="inline-block h-12 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                📷 Add Photo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

