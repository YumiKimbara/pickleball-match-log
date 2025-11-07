"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MatchState {
  opponentId: number;
  opponentName: string;
  scoreA: number;
  scoreB: number;
  playTo: number;
  history: { scoreA: number; scoreB: number }[];
  timestamp: number;
}

const MATCH_STORAGE_KEY = 'pickleball_match_in_progress';

export default function ResumeMatchBanner() {
  const [matchState, setMatchState] = useState<MatchState | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(MATCH_STORAGE_KEY);
    if (saved) {
      try {
        const state: MatchState = JSON.parse(saved);
        // Only show if match is less than 24 hours old
        const hoursSince = (Date.now() - state.timestamp) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          setMatchState(state);
        } else {
          // Clear stale match
          localStorage.removeItem(MATCH_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse saved match:', e);
      }
    }
  }, []);

  const handleDismiss = () => {
    localStorage.removeItem(MATCH_STORAGE_KEY);
    setMatchState(null);
  };

  if (!matchState) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-5 mb-6 relative shadow-md">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <span className="text-xl">×</span>
      </button>
      
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">⏸️</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Match in Progress</h3>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-medium">vs {matchState.opponentName}</span>
            <span className="text-gray-400">•</span>
            <span className="font-bold text-2xl">{matchState.scoreA} - {matchState.scoreB}</span>
          </div>
        </div>
      </div>
      
      <Link
        href="/dashboard/match/new"
        className="inline-flex items-center justify-center h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-600 shadow-lg transform hover:scale-105 transition-all"
      >
        ▶️ Resume Match
      </Link>
    </div>
  );
}

