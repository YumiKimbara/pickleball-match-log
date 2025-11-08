import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';

// Get duplicate users and opponents
export async function GET() {
  try {
    await requireAdmin();
    
    const allUsers = await db.getAllUsers();
    const allOpponents = await db.getAllOpponents();

    // 1. Find duplicate users by email
    const usersByEmail = new Map<string, typeof allUsers>();
    allUsers.forEach(user => {
      const email = user.email.toLowerCase();
      const existing = usersByEmail.get(email) || [];
      usersByEmail.set(email, [...existing, user]);
    });

    const duplicateUsersByEmail = Array.from(usersByEmail.entries())
      .filter(([_, users]) => users.length > 1)
      .map(([key, users]) => ({ key: `Email: ${key}`, users }));

    // 2. Find duplicate users by name
    const usersByName = new Map<string, typeof allUsers>();
    allUsers.forEach(user => {
      if (user.name) {
        const name = user.name.toLowerCase().replace(/\s+/g, '');
        const existing = usersByName.get(name) || [];
        usersByName.set(name, [...existing, user]);
      }
    });

    const duplicateUsersByName = Array.from(usersByName.entries())
      .filter(([_, users]) => users.length > 1)
      .map(([key, users]) => ({ key: `Name: ${users[0]?.name || key}`, users }));

    const duplicateUsers = [...duplicateUsersByEmail, ...duplicateUsersByName];

    // 2. Find duplicate opponents by email
    const opponentsByEmail = new Map<string, typeof allOpponents>();
    allOpponents.forEach(opponent => {
      if (opponent.email) {
        const email = opponent.email.toLowerCase();
        const existing = opponentsByEmail.get(email) || [];
        opponentsByEmail.set(email, [...existing, opponent]);
      }
    });

    const duplicateOpponentsByEmail = Array.from(opponentsByEmail.entries())
      .filter(([_, opponents]) => opponents.length > 1)
      .map(([key, opponents]) => ({ key: `Email: ${key}`, opponents }));

    // 3. Find duplicate opponents by name (check all opponents, not just those without email)
    const opponentsByName = new Map<string, typeof allOpponents>();
    allOpponents.forEach(opponent => {
      const name = opponent.name.toLowerCase().replace(/\s+/g, '');
      const existing = opponentsByName.get(name) || [];
      opponentsByName.set(name, [...existing, opponent]);
    });

    const duplicateOpponentsByName = Array.from(opponentsByName.entries())
      .filter(([_, opponents]) => opponents.length > 1)
      .map(([key, opponents]) => ({ key: `Name: ${opponents[0]?.name || key}`, opponents }));

    // 4. Find cross-duplicates: user email matches opponent email
    const crossDuplicates: Array<{ key: string; opponents: typeof allOpponents; userId?: number; userEmail?: string }> = [];
    allUsers.forEach(user => {
      const userEmail = user.email.toLowerCase();
      const matchingOpponents = allOpponents.filter(
        opp => opp.email && opp.email.toLowerCase() === userEmail && opp.user_id !== user.id
      );
      if (matchingOpponents.length > 0) {
        crossDuplicates.push({
          key: `Cross-duplicate: ${user.email}`,
          opponents: matchingOpponents,
          userId: user.id,
          userEmail: user.email
        });
      }
    });

    const duplicateOpponents = [...duplicateOpponentsByEmail, ...duplicateOpponentsByName, ...crossDuplicates];

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

