"use client";

import { useEffect } from "react";

interface Opponent {
  id: number;
  name: string;
  photo_url: string | null;
  elo: number;
}

const OPPONENTS_CACHE_KEY = 'pickleball_opponents_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function cacheOpponents(opponents: Opponent[]) {
  if (typeof window !== 'undefined') {
    const cache = {
      data: opponents,
      timestamp: Date.now(),
    };
    localStorage.setItem(OPPONENTS_CACHE_KEY, JSON.stringify(cache));
  }
}

export function getCachedOpponents(): Opponent[] | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(OPPONENTS_CACHE_KEY);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    if (age < CACHE_DURATION) {
      return data;
    }
  } catch (e) {
    console.error('Failed to parse cached opponents:', e);
  }
  
  return null;
}

export default function OpponentsCache({ opponents }: { opponents: Opponent[] }) {
  useEffect(() => {
    cacheOpponents(opponents);
  }, [opponents]);

  return null;
}

