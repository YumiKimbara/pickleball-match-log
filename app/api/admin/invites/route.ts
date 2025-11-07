import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get all invite tokens
export async function GET() {
  try {
    await requireAdmin();
    const tokens = await db.getAllInviteTokens();
    return NextResponse.json({ tokens });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

// Delete invite token
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 });
    }

    await db.deleteInviteToken(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete invite' },
      { status: 500 }
    );
  }
}

// Expire invite token
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 });
    }

    await db.expireInviteToken(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to expire invite' },
      { status: 500 }
    );
  }
}

