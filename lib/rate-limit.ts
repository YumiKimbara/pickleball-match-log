/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider Redis-based solution
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Unique identifier (e.g., user ID or IP) */
  identifier: string;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check and update rate limit for an identifier
 */
export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, limit, windowSeconds } = config;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = store.get(identifier);

  // No entry or expired window - start fresh
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Within window - check limit
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  store.set(identifier, entry);

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    return {
      success: true,
      limit,
      remaining: limit,
      resetAt: now + (windowSeconds * 1000),
    };
  }

  return {
    success: entry.count < limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit presets for common operations
 */
export const RateLimits = {
  /** 5 invites per hour */
  INVITE_CREATE: { limit: 5, windowSeconds: 3600 },
  
  /** 10 photo uploads per hour */
  PHOTO_UPLOAD: { limit: 10, windowSeconds: 3600 },
  
  /** 50 matches per hour (generous for active playing) */
  MATCH_CREATE: { limit: 50, windowSeconds: 3600 },
  
  /** 20 opponent creations per day */
  OPPONENT_CREATE: { limit: 20, windowSeconds: 86400 },
} as const;

