import { requireAdmin } from '@/lib/auth-guards';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { sql } from '@vercel/postgres';
import RecalculateButton from './RecalculateButton';

async function recalculateElo() {
  'use server';
  await requireAdmin();

  try {
    // Step 1: Reset all ELOs to default (1500)
    await sql`UPDATE users SET elo = 1500`;
    await sql`UPDATE opponents SET elo = 1500`;

    // Step 2: Get all matches ordered chronologically
    const matches = await db.getAllMatches();
    
    // Sort by played_at ascending (oldest first)
    const sortedMatches = matches.sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    // Step 3: Recalculate ELO for each match in order
    for (const match of sortedMatches) {
      // Get current ELO ratings
      let eloA = 1500;
      let eloB = 1500;

      if (match.player_a_type === 'user') {
        const user = await db.getUserById(match.player_a_id);
        eloA = Number(user?.elo || 1500);
      } else {
        const opponent = await db.getOpponentById(match.player_a_id);
        eloA = Number(opponent?.elo || 1500);
      }

      if (match.player_b_type === 'user') {
        const user = await db.getUserById(match.player_b_id);
        eloB = Number(user?.elo || 1500);
      } else {
        const opponent = await db.getOpponentById(match.player_b_id);
        eloB = Number(opponent?.elo || 1500);
      }

      // Calculate ELO changes
      const K = 32; // K-factor
      const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
      const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

      const actualA = match.score_a > match.score_b ? 1 : 0;
      const actualB = match.score_b > match.score_a ? 1 : 0;

      const changeA = Math.round(K * (actualA - expectedA));
      const changeB = Math.round(K * (actualB - expectedB));

      // Ensure numeric addition, not string concatenation
      const newEloA = Number(eloA) + Number(changeA);
      const newEloB = Number(eloB) + Number(changeB);

      // Update ELO ratings
      if (match.player_a_type === 'user') {
        await db.updateUserElo(match.player_a_id, newEloA);
      } else {
        await db.updateOpponentElo(match.player_a_id, newEloA);
      }

      if (match.player_b_type === 'user') {
        await db.updateUserElo(match.player_b_id, newEloB);
      } else {
        await db.updateOpponentElo(match.player_b_id, newEloB);
      }

      // Update match ELO changes
      await sql`
        UPDATE matches 
        SET elo_change_a = ${changeA}, elo_change_b = ${changeB}
        WHERE id = ${match.id}
      `;
    }

    revalidatePath('/dashboard/admin/stats');
    return { success: true, matchesProcessed: sortedMatches.length };
  } catch (error) {
    console.error('ELO recalculation error:', error);
    throw error;
  }
}

export default async function AdminStatsPage() {
  await requireAdmin();

  // Get current stats
  const users = await db.getAllUsers();
  const opponents = await db.getAllOpponents();
  const matches = await db.getAllMatches();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">System Tools</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-4">📊 ELO Recalculation</h2>
        <p className="text-gray-600 mb-6">
          This will reset all ELO ratings to 1500 and recalculate them based on match history (chronologically).
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Current Stats:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Total Users: {users.length}</li>
            <li>• Total Opponents: {opponents.length}</li>
            <li>• Total Matches: {matches.length}</li>
          </ul>
        </div>

        <RecalculateButton onRecalculate={recalculateElo} />

        <div className="mt-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-3">
          ⚠️ <strong>Warning:</strong> This operation will reset all current ELO ratings and recalculate from scratch. This may take a few seconds.
        </div>
      </div>

      <div className="mt-8">
        <Link 
          href="/dashboard/admin"
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

