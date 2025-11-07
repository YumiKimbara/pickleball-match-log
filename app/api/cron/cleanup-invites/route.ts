import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Vercel Cron job to clean up expired invite tokens
 * Runs daily at midnight (00:00 UTC)
 * 
 * Security: Vercel Cron jobs are authenticated automatically by Vercel's infrastructure
 * Only requests from Vercel's cron service can trigger this endpoint
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete invite tokens that expired more than 7 days ago
    const result = await db.deleteExpiredInvites();

    console.log(`[Cron] Cleaned up ${result.deletedCount} expired invite tokens`);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Failed to cleanup invites:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup invites' },
      { status: 500 }
    );
  }
}

