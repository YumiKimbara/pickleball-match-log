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

  async updateUserPhoto(userId: number, photoUrl: string): Promise<void> {
    await sql`
      UPDATE users SET photo_url = ${photoUrl}, updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  async updateUserElo(userId: number, newElo: number): Promise<void> {
    await sql`
      UPDATE users SET elo = ${newElo}, updated_at = NOW()
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
};
