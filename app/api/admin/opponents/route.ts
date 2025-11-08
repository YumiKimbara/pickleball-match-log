import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get all opponents
export async function GET() {
  try {
    await requireAdmin();
    const opponents = await db.getAllOpponents();
    
    // For linked opponents, fetch the user's email
    const opponentsWithUserEmail = await Promise.all(
      opponents.map(async (opponent) => {
        if (opponent.user_id) {
          const user = await db.getUserById(opponent.user_id);
          return {
            ...opponent,
            linked_user_email: user?.email || null,
          };
        }
        return opponent;
      })
    );
    
    return NextResponse.json({ opponents: opponentsWithUserEmail });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opponents' },
      { status: 500 }
    );
  }
}

// Delete opponent (admin only - ownership already enforced by requireAdmin)
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Opponent ID required' }, { status: 400 });
    }

    // Admin can delete any opponent
    await db.deleteOpponent(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete opponent' },
      { status: 500 }
    );
  }
}

// Update opponent
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { id, name, email } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Opponent ID required' }, { status: 400 });
    }

    if (name !== undefined) {
      await db.updateOpponentName(id, name);
    }
    if (email !== undefined) {
      try {
        await db.updateOpponentEmail(id, email);
      } catch (error: any) {
        // Check if it's a unique constraint violation
        if (error?.code === '23505' && error?.constraint === 'opponents_email_key') {
          return NextResponse.json(
            { error: `Email "${email}" is already used by another opponent` },
            { status: 409 }
          );
        }
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update opponent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update opponent' },
      { status: 500 }
    );
  }
}

