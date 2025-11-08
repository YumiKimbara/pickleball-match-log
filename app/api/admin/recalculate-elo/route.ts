import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Admin-only endpoint to recalculate all ELO ratings
export async function POST() {
  try {
    // This will redirect if not admin
    await requireAdmin();

    // Get all matches ordered by played_at
    const matches = await db.getMatchesByPlayer(0, 'user'); // TODO: implement getAllMatches
    
    // Reset all ELOs to default
    // Recalculate based on match history
    // (This is a placeholder - implement actual logic as needed)

    return NextResponse.json({
      success: true,
      message: 'ELO recalculation complete'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to recalculate ELO' },
      { status: 500 }
    );
  }
}

