import { sql } from '@vercel/postgres';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  photo_url: string | null;
  elo: number;
  created_at: Date;
  updated_at: Date;
}

export interface Opponent {
  id: number;
  name: string;
  email: string | null;
  photo_url: string | null;
  elo: number;
  created_by_user_id: number | null;
  user_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Match {
  id: number;
  player_a_id: number;
  player_a_type: 'user' | 'opponent';
  player_b_id: number;
  player_b_type: 'user' | 'opponent';
  score_a: number;
  score_b: number;
  win_by: number;
  play_to: number;
  winner_id: number | null;
  winner_type: 'user' | 'opponent' | null;
  elo_change_a: number | null;
  elo_change_b: number | null;
  photo_url: string | null;
  logged_by_user_id: number | null;
  played_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InviteToken {
  id: number;
  token: string;
  opponent_id: number | null;
  created_by_user_id: number;
  expires_at: Date;
  redeemed_at: Date | null;
  redeemed_by_user_id: number | null;
  created_at: Date;
}

export const db = {
  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql<User>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async getUserById(id: number): Promise<User | null> {
    const result = await sql<User>`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async createUser(email: string, name: string | null, role: 'admin' | 'user' = 'user'): Promise<User> {
    const result = await sql<User>`
      INSERT INTO users (email, name, role)
      VALUES (${email}, ${name}, ${role})
      RETURNING *
    `;
    return result.rows[0];
  },

  async updateUserElo(userId: number, newElo: number): Promise<void> {
    await sql`
      UPDATE users SET elo = ${newElo}, updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  async getAllUsers(): Promise<User[]> {
    const result = await sql<User>`
      SELECT * FROM users ORDER BY created_at DESC
    `;
    return result.rows;
  },

  async updateUserRole(userId: number, role: 'admin' | 'user'): Promise<void> {
    await sql`
      UPDATE users SET role = ${role}, updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  async updateUserRoleByEmail(email: string, role: 'admin' | 'user'): Promise<void> {
    await sql`
      UPDATE users SET role = ${role}, updated_at = NOW()
      WHERE email = ${email}
    `;
  },

  async updateUserName(userId: number, name: string): Promise<void> {
    await sql`
      UPDATE users SET name = ${name}, updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  async updateUserPhoto(userId: number, photoUrl: string | null): Promise<void> {
    await sql`
      UPDATE users SET photo_url = ${photoUrl}, updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  // Opponents
  async createOpponent(
    name: string,
    email: string | null,
    createdByUserId: number,
    photoUrl: string | null = null
  ): Promise<Opponent> {
    const result = await sql<Opponent>`
      INSERT INTO opponents (name, email, photo_url, created_by_user_id)
      VALUES (${name}, ${email}, ${photoUrl}, ${createdByUserId})
      RETURNING *
    `;
    return result.rows[0];
  },

  async getOpponentsByCreator(userId: number): Promise<Opponent[]> {
    const result = await sql<Opponent>`
      SELECT * FROM opponents
      WHERE created_by_user_id = ${userId}
      ORDER BY name ASC
    `;
    return result.rows;
  },

  async getAllOpponents(): Promise<Opponent[]> {
    const result = await sql<Opponent>`
      SELECT * FROM opponents ORDER BY name ASC
    `;
    return result.rows;
  },

  async getOpponentById(id: number): Promise<Opponent | null> {
    const result = await sql<Opponent>`
      SELECT * FROM opponents WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async getOpponentByEmail(email: string): Promise<Opponent | null> {
    const result = await sql<Opponent>`
      SELECT * FROM opponents WHERE email = ${email} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async linkOpponentToUser(opponentId: number, userId: number): Promise<void> {
    await sql`
      UPDATE opponents SET user_id = ${userId}, updated_at = NOW()
      WHERE id = ${opponentId}
    `;
  },

  async updateOpponentElo(opponentId: number, newElo: number): Promise<void> {
    await sql`
      UPDATE opponents SET elo = ${newElo}, updated_at = NOW()
      WHERE id = ${opponentId}
    `;
  },

  async updateOpponentPhoto(opponentId: number, photoUrl: string | null): Promise<void> {
    await sql`
      UPDATE opponents SET photo_url = ${photoUrl}, updated_at = NOW()
      WHERE id = ${opponentId}
    `;
  },

  // Invite Tokens
  async createInviteToken(
    opponentId: number | null,
    createdByUserId: number,
    expiresInHours: number = 168 // 7 days
  ): Promise<InviteToken> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const result = await sql<InviteToken>`
      INSERT INTO invite_tokens (token, opponent_id, created_by_user_id, expires_at)
      VALUES (${token}, ${opponentId}, ${createdByUserId}, ${expiresAt.toISOString()})
      RETURNING *
    `;
    return result.rows[0];
  },

  async getInviteToken(token: string): Promise<InviteToken | null> {
    const result = await sql<InviteToken>`
      SELECT * FROM invite_tokens WHERE token = ${token} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async redeemInviteToken(tokenId: number, redeemedByUserId: number): Promise<void> {
    await sql`
      UPDATE invite_tokens
      SET redeemed_at = NOW(), redeemed_by_user_id = ${redeemedByUserId}
      WHERE id = ${tokenId}
    `;
  },

  // Matches
  async createMatch(match: {
    playerAId: number;
    playerAType: 'user' | 'opponent';
    playerBId: number;
    playerBType: 'user' | 'opponent';
    scoreA: number;
    scoreB: number;
    playTo: number;
    winBy: number;
    winnerId: number | null;
    winnerType: 'user' | 'opponent' | null;
    eloChangeA: number | null;
    eloChangeB: number | null;
    loggedByUserId: number;
    photoUrl?: string | null;
  }): Promise<Match> {
    const result = await sql<Match>`
      INSERT INTO matches (
        player_a_id, player_a_type, player_b_id, player_b_type,
        score_a, score_b, play_to, win_by,
        winner_id, winner_type, elo_change_a, elo_change_b,
        logged_by_user_id, photo_url
      )
      VALUES (
        ${match.playerAId}, ${match.playerAType},
        ${match.playerBId}, ${match.playerBType},
        ${match.scoreA}, ${match.scoreB},
        ${match.playTo}, ${match.winBy},
        ${match.winnerId}, ${match.winnerType},
        ${match.eloChangeA}, ${match.eloChangeB},
        ${match.loggedByUserId}, ${match.photoUrl || null}
      )
      RETURNING *
    `;
    return result.rows[0];
  },

  async getMatchesByPlayer(playerId: number, playerType: 'user' | 'opponent'): Promise<Match[]> {
    const result = await sql<Match>`
      SELECT * FROM matches
      WHERE (player_a_id = ${playerId} AND player_a_type = ${playerType})
         OR (player_b_id = ${playerId} AND player_b_type = ${playerType})
      ORDER BY played_at DESC
    `;
    return result.rows;
  },

  async getMatchById(matchId: number): Promise<Match | null> {
    const result = await sql<Match>`
      SELECT * FROM matches WHERE id = ${matchId} LIMIT 1
    `;
    return result.rows[0] || null;
  },

  async updateMatchPhoto(matchId: number, photoUrl: string): Promise<void> {
    await sql`
      UPDATE matches SET photo_url = ${photoUrl}, updated_at = NOW()
      WHERE id = ${matchId}
    `;
  },

  async getAllMatches(): Promise<Match[]> {
    const result = await sql<Match>`
      SELECT * FROM matches ORDER BY played_at DESC
    `;
    return result.rows;
  },

  async deleteMatch(matchId: number): Promise<void> {
    await sql`
      DELETE FROM matches WHERE id = ${matchId}
    `;
  },

  async updateMatchScores(matchId: number, scoreA: number, scoreB: number): Promise<void> {
    // Determine new winner
    const winnerId = scoreA > scoreB ? 
      (await sql`SELECT player_a_id FROM matches WHERE id = ${matchId}`).rows[0]?.player_a_id :
      (await sql`SELECT player_b_id FROM matches WHERE id = ${matchId}`).rows[0]?.player_b_id;
    
    const winnerType = scoreA > scoreB ?
      (await sql`SELECT player_a_type FROM matches WHERE id = ${matchId}`).rows[0]?.player_a_type :
      (await sql`SELECT player_b_type FROM matches WHERE id = ${matchId}`).rows[0]?.player_b_type;

    await sql`
      UPDATE matches 
      SET score_a = ${scoreA}, 
          score_b = ${scoreB},
          winner_id = ${winnerId},
          winner_type = ${winnerType},
          updated_at = NOW()
      WHERE id = ${matchId}
    `;
  },

  // In-progress matches
  async saveInProgressMatch(data: {
    userId: number;
    playerAId: number;
    playerAType: 'user' | 'opponent';
    playerBId: number;
    playerBType: 'user' | 'opponent';
    scoreA: number;
    scoreB: number;
    playTo: number;
    winBy: number;
    scoreHistory: any[];
  }): Promise<void> {
    await sql`
      INSERT INTO in_progress_matches (
        user_id, player_a_id, player_a_type, player_b_id, player_b_type,
        score_a, score_b, play_to, win_by, score_history, updated_at
      )
      VALUES (
        ${data.userId}, ${data.playerAId}, ${data.playerAType},
        ${data.playerBId}, ${data.playerBType}, ${data.scoreA}, ${data.scoreB},
        ${data.playTo}, ${data.winBy}, ${JSON.stringify(data.scoreHistory)}, NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        player_a_id = ${data.playerAId},
        player_a_type = ${data.playerAType},
        player_b_id = ${data.playerBId},
        player_b_type = ${data.playerBType},
        score_a = ${data.scoreA},
        score_b = ${data.scoreB},
        play_to = ${data.playTo},
        win_by = ${data.winBy},
        score_history = ${JSON.stringify(data.scoreHistory)},
        updated_at = NOW()
    `;
  },

  async getInProgressMatch(userId: number) {
    const result = await sql`
      SELECT * FROM in_progress_matches WHERE user_id = ${userId} LIMIT 1
    `;
    if (result.rows[0]) {
      return {
        ...result.rows[0],
        score_history: result.rows[0].score_history || []
      };
    }
    return null;
  },

  async deleteInProgressMatch(userId: number): Promise<void> {
    await sql`
      DELETE FROM in_progress_matches WHERE user_id = ${userId}
    `;
  },

  // Admin Functions
  
  // Invite Token Management
  async getAllInviteTokens(): Promise<InviteToken[]> {
    const result = await sql<InviteToken>`
      SELECT * FROM invite_tokens ORDER BY created_at DESC
    `;
    return result.rows;
  },

  async expireInviteToken(tokenId: number): Promise<void> {
    await sql`
      UPDATE invite_tokens 
      SET expires_at = NOW()
      WHERE id = ${tokenId}
    `;
  },

  async deleteInviteToken(tokenId: number): Promise<void> {
    await sql`
      DELETE FROM invite_tokens WHERE id = ${tokenId}
    `;
  },

  async deleteExpiredInvites(): Promise<{ deletedCount: number }> {
    const result = await sql`
      DELETE FROM invite_tokens 
      WHERE expires_at < NOW() - INTERVAL '7 days'
      RETURNING id
    `;
    return { deletedCount: result.rowCount || 0 };
  },

  // User Management
  async deleteUser(userId: number): Promise<void> {
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;
  },

  async mergeUsers(keepUserId: number, deleteUserId: number): Promise<void> {
    // Transfer all matches
    await sql`
      UPDATE matches 
      SET player_a_id = ${keepUserId}
      WHERE player_a_id = ${deleteUserId} AND player_a_type = 'user'
    `;
    await sql`
      UPDATE matches 
      SET player_b_id = ${keepUserId}
      WHERE player_b_id = ${deleteUserId} AND player_b_type = 'user'
    `;
    await sql`
      UPDATE matches 
      SET winner_id = ${keepUserId}
      WHERE winner_id = ${deleteUserId} AND winner_type = 'user'
    `;

    // Transfer opponents created
    await sql`
      UPDATE opponents 
      SET created_by_user_id = ${keepUserId}
      WHERE created_by_user_id = ${deleteUserId}
    `;

    // Transfer invite tokens
    await sql`
      UPDATE invite_tokens 
      SET created_by_user_id = ${keepUserId}
      WHERE created_by_user_id = ${deleteUserId}
    `;

    // Delete the old user
    await sql`
      DELETE FROM users WHERE id = ${deleteUserId}
    `;
  },

  // Opponent Management
  async deleteOpponent(opponentId: number): Promise<void> {
    await sql`
      DELETE FROM opponents WHERE id = ${opponentId}
    `;
  },

  async mergeOpponents(keepOpponentId: number, deleteOpponentId: number): Promise<void> {
    // Transfer all matches
    await sql`
      UPDATE matches 
      SET player_a_id = ${keepOpponentId}
      WHERE player_a_id = ${deleteOpponentId} AND player_a_type = 'opponent'
    `;
    await sql`
      UPDATE matches 
      SET player_b_id = ${keepOpponentId}
      WHERE player_b_id = ${deleteOpponentId} AND player_b_type = 'opponent'
    `;
    await sql`
      UPDATE matches 
      SET winner_id = ${keepOpponentId}
      WHERE winner_id = ${deleteOpponentId} AND winner_type = 'opponent'
    `;

    // Delete the old opponent
    await sql`
      DELETE FROM opponents WHERE id = ${deleteOpponentId}
    `;
  },

  async updateOpponentName(opponentId: number, name: string): Promise<void> {
    await sql`
      UPDATE opponents 
      SET name = ${name}, updated_at = NOW()
      WHERE id = ${opponentId}
    `;
  },

  async updateOpponentEmail(opponentId: number, email: string | null): Promise<void> {
    await sql`
      UPDATE opponents 
      SET email = ${email}, updated_at = NOW()
      WHERE id = ${opponentId}
    `;
  },

  // Photo Management
  async getAllPhotos(): Promise<Array<{ 
    id: number; 
    photo_url: string; 
    type: 'user' | 'opponent' | 'match';
    entity_id: number;
    name?: string;
    email?: string;
  }>> {
    // Get user photos
    const userPhotos = await sql`
      SELECT 
        id as entity_id, 
        photo_url, 
        'user' as type,
        name,
        email
      FROM users 
      WHERE photo_url IS NOT NULL
    `;

    // Get opponent photos
    const opponentPhotos = await sql`
      SELECT 
        id as entity_id,
        photo_url,
        'opponent' as type,
        name,
        email
      FROM opponents
      WHERE photo_url IS NOT NULL
    `;

    // Get match photos
    const matchPhotos = await sql`
      SELECT 
        id as entity_id,
        photo_url,
        'match' as type,
        NULL as name,
        NULL as email
      FROM matches
      WHERE photo_url IS NOT NULL
    `;

    return [
      ...userPhotos.rows,
      ...opponentPhotos.rows,
      ...matchPhotos.rows
    ] as any[];
  },

  async deletePhoto(type: 'user' | 'opponent' | 'match', entityId: number): Promise<void> {
    if (type === 'user') {
      await sql`UPDATE users SET photo_url = NULL WHERE id = ${entityId}`;
    } else if (type === 'opponent') {
      await sql`UPDATE opponents SET photo_url = NULL WHERE id = ${entityId}`;
    } else if (type === 'match') {
      await sql`UPDATE matches SET photo_url = NULL WHERE id = ${entityId}`;
    }
  },

  // Duplicate Detection
  async findDuplicateUsers(): Promise<Array<{ email: string; users: User[] }>> {
    // Find users with similar names or same email
    const result = await sql<User>`
      SELECT u1.*, 
        ARRAY_AGG(u2.id) FILTER (WHERE u2.id != u1.id) as duplicate_ids
      FROM users u1
      LEFT JOIN users u2 ON (
        LOWER(u1.email) = LOWER(u2.email) OR
        (u1.name IS NOT NULL AND u2.name IS NOT NULL AND 
         SIMILARITY(LOWER(u1.name), LOWER(u2.name)) > 0.8)
      )
      WHERE u1.id < u2.id OR u2.id IS NULL
      GROUP BY u1.id
      HAVING COUNT(u2.id) > 0
    `;
    
    return result.rows as any;
  },

  async findDuplicateOpponents(): Promise<Array<{ name: string; opponents: Opponent[] }>> {
    const result = await sql<Opponent>`
      SELECT o1.*, 
        ARRAY_AGG(o2.id) FILTER (WHERE o2.id != o1.id) as duplicate_ids
      FROM opponents o1
      LEFT JOIN opponents o2 ON (
        (o1.email IS NOT NULL AND o2.email IS NOT NULL AND LOWER(o1.email) = LOWER(o2.email)) OR
        SIMILARITY(LOWER(o1.name), LOWER(o2.name)) > 0.8
      )
      WHERE o1.id < o2.id OR o2.id IS NULL
      GROUP BY o1.id
      HAVING COUNT(o2.id) > 0
    `;
    
    return result.rows as any;
  },
};
