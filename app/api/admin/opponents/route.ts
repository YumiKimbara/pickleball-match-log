import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get all opponents
export async function GET() {
  try {
    await requireAdmin();
    const opponents = await db.getAllOpponents();
    return NextResponse.json({ opponents });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opponents' },
      { status: 500 }
    );
  }
}

// Delete opponent
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Opponent ID required' }, { status: 400 });
    }

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
      await db.updateOpponentEmail(id, email);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update opponent' },
      { status: 500 }
    );
  }
}

