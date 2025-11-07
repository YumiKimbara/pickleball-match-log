import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { ADMIN_EMAIL } from '@/lib/constants';

// One-time endpoint to fix admin role for existing user
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only allow the admin email to run this
    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Only admin can run this' },
        { status: 403 }
      );
    }

    // Update the role in the database
    await sql`
      UPDATE users 
      SET role = 'admin', updated_at = NOW()
      WHERE email = ${ADMIN_EMAIL}
    `;

    return NextResponse.json({
      success: true,
      message: `Role updated to admin for ${ADMIN_EMAIL}. Please sign out and sign in again.`
    });
  } catch (error: any) {
    console.error('Error fixing role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix role' },
      { status: 500 }
    );
  }
}

