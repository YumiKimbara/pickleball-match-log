import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Merge two opponents
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { keepId, deleteId } = await request.json();
    
    if (!keepId || !deleteId) {
      return NextResponse.json(
        { error: 'Both keepId and deleteId required' },
        { status: 400 }
      );
    }

    if (keepId === deleteId) {
      return NextResponse.json(
        { error: 'Cannot merge opponent with itself' },
        { status: 400 }
      );
    }

    await db.mergeOpponents(keepId, deleteId);
    return NextResponse.json({ 
      success: true,
      message: `Opponent ${deleteId} merged into ${keepId}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to merge opponents' },
      { status: 500 }
    );
  }
}

