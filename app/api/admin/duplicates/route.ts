import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get duplicate users and opponents
export async function GET() {
  try {
    await requireAdmin();
    
    // For now, we'll use a simpler approach - find by exact email match
    const allUsers = await db.getAllUsers();
    const allOpponents = await db.getAllOpponents();

    // Group users by email (case insensitive)
    const usersByEmail = new Map<string, typeof allUsers>();
    allUsers.forEach(user => {
      const email = user.email.toLowerCase();
      const existing = usersByEmail.get(email) || [];
      usersByEmail.set(email, [...existing, user]);
    });

    const duplicateUsers = Array.from(usersByEmail.entries())
      .filter(([_, users]) => users.length > 1)
      .map(([email, users]) => ({ email, users }));

    // Group opponents by email or similar names
    const opponentsByKey = new Map<string, typeof allOpponents>();
    allOpponents.forEach(opponent => {
      const key = opponent.email 
        ? opponent.email.toLowerCase() 
        : opponent.name.toLowerCase().replace(/\s+/g, '');
      const existing = opponentsByKey.get(key) || [];
      opponentsByKey.set(key, [...existing, opponent]);
    });

    const duplicateOpponents = Array.from(opponentsByKey.entries())
      .filter(([_, opponents]) => opponents.length > 1)
      .map(([key, opponents]) => ({ key, opponents }));

    return NextResponse.json({ 
      users: duplicateUsers,
      opponents: duplicateOpponents
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to find duplicates' },
      { status: 500 }
    );
  }
}

