import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Merge two users
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
        { error: 'Cannot merge user with itself' },
        { status: 400 }
      );
    }

    await db.mergeUsers(keepId, deleteId);
    return NextResponse.json({ 
      success: true,
      message: `User ${deleteId} merged into ${keepId}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to merge users' },
      { status: 500 }
    );
  }
}

