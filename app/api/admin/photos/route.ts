import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get all photos
export async function GET() {
  try {
    await requireAdmin();
    const photos = await db.getAllPhotos();
    return NextResponse.json({ photos });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// Delete photo
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { type, entityId } = await request.json();
    
    if (!type || !entityId) {
      return NextResponse.json(
        { error: 'Type and entityId required' },
        { status: 400 }
      );
    }

    if (!['user', 'opponent', 'match'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be user, opponent, or match' },
        { status: 400 }
      );
    }

    await db.deletePhoto(type as 'user' | 'opponent' | 'match', entityId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

