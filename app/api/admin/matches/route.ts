import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get all matches
export async function GET() {
  try {
    await requireAdmin();
    
    // Get all matches with player details
    const matches = await db.getAllMatches();
    
    return NextResponse.json({ matches });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// Delete match
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
    }

    await db.deleteMatch(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete match' },
      { status: 500 }
    );
  }
}

// Update match
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { id, scoreA, scoreB } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
    }

    if (scoreA === undefined || scoreB === undefined) {
      return NextResponse.json({ error: 'Scores required' }, { status: 400 });
    }

    // Update the match scores
    await db.updateMatchScores(id, scoreA, scoreB);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    );
  }
}

