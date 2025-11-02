-- Users table (both admin and regular users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  photo_url TEXT,
  elo DECIMAL(10, 2) DEFAULT 1500.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Opponents (can exist without accounts)
CREATE TABLE IF NOT EXISTS opponents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  photo_url TEXT,
  elo DECIMAL(10, 2) DEFAULT 1500.00,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- linked account if claimed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invite tokens for QR code linking
CREATE TABLE IF NOT EXISTS invite_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  opponent_id INTEGER REFERENCES opponents(id) ON DELETE CASCADE,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP,
  redeemed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires ON invite_tokens(expires_at);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  player_a_id INTEGER NOT NULL, -- can be user_id or opponent_id
  player_a_type VARCHAR(20) NOT NULL CHECK (player_a_type IN ('user', 'opponent')),
  player_b_id INTEGER NOT NULL,
  player_b_type VARCHAR(20) NOT NULL CHECK (player_b_type IN ('user', 'opponent')),
  score_a INTEGER NOT NULL,
  score_b INTEGER NOT NULL,
  win_by INTEGER DEFAULT 2,
  play_to INTEGER DEFAULT 11,
  winner_id INTEGER, -- ID of winner
  winner_type VARCHAR(20) CHECK (winner_type IN ('user', 'opponent')),
  elo_change_a DECIMAL(10, 2),
  elo_change_b DECIMAL(10, 2),
  photo_url TEXT, -- post-match photo
  logged_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_player_a ON matches(player_a_id, player_a_type);
CREATE INDEX IF NOT EXISTS idx_matches_player_b ON matches(player_b_id, player_b_type);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);

-- In-progress match (for resume functionality)
CREATE TABLE IF NOT EXISTS in_progress_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  player_a_id INTEGER NOT NULL,
  player_a_type VARCHAR(20) NOT NULL,
  player_b_id INTEGER NOT NULL,
  player_b_type VARCHAR(20) NOT NULL,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  play_to INTEGER DEFAULT 11,
  win_by INTEGER DEFAULT 2,
  score_history JSONB DEFAULT '[]', -- [{scoreA: 0, scoreB: 1, timestamp: "..."}]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
