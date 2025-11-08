"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";

interface Opponent {
  id: number;
  name: string;
  email: string | null;
  photo_url: string | null;
  elo: number;
}

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
}

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

export default function MatchLogger({ user, opponents }: { user: User; opponents: Opponent[] }) {
  const router = useRouter();
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [scoreA, setScoreA] = useState(0); // User's score
  const [scoreB, setScoreB] = useState(0); // Opponent's score
  const [playTo, setPlayTo] = useState(11);
  const [winBy] = useState(2);
  const [history, setHistory] = useState<{ scoreA: number; scoreB: number }[]>([]);
  const [isGameEnding, setIsGameEnding] = useState(false);
  const [gameResult, setGameResult] = useState<{ won: boolean; eloChange: number; matchId: number } | null>(null);

  // Load saved match on mount
  useEffect(() => {
    const saved = localStorage.getItem(MATCH_STORAGE_KEY);
    if (saved) {
      try {
        const state: MatchState = JSON.parse(saved);
        const opponent = opponents.find(o => o.id === state.opponentId);
        if (opponent) {
          setSelectedOpponent(opponent);
          setScoreA(state.scoreA);
          setScoreB(state.scoreB);
          setPlayTo(state.playTo);
          setHistory(state.history);
        }
      } catch (e) {
        console.error('Failed to restore match:', e);
      }
    }
  }, [opponents]);

  // Save match state whenever it changes
  useEffect(() => {
    if (selectedOpponent && !gameResult) {
      const state: MatchState = {
        opponentId: selectedOpponent.id,
        opponentName: selectedOpponent.name,
        scoreA,
        scoreB,
        playTo,
        history,
        timestamp: Date.now(),
      };
      localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(state));
    }
  }, [selectedOpponent, scoreA, scoreB, playTo, history, gameResult]);

  const clearSavedMatch = () => {
    localStorage.removeItem(MATCH_STORAGE_KEY);
  };

  if (!selectedOpponent) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Select Opponent</h1>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Dashboard
        </a>
        {opponents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">No opponents yet!</p>
            <a
              href="/dashboard/opponents/new"
              className="inline-block h-12 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Add First Opponent
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {opponents.map((opp) => (
              <button
                key={opp.id}
                onClick={() => setSelectedOpponent(opp)}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-all"
              >
                <img
                  src={getAvatarUrl(opp.photo_url, opp.name, opp.email)}
                  alt={opp.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-gray-900">{opp.name}</div>
                  {opp.email && (
                    <div className="text-sm text-gray-500">{opp.email}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    ELO: {opp.elo}
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(patterns[type]);
    }
  };

  const addPointA = () => {
    hapticFeedback('medium');
    const newScoreA = scoreA + 1;
    setScoreA(newScoreA);
    setHistory([...history, { scoreA: newScoreA, scoreB }]);
  };

  const addPointB = () => {
    hapticFeedback('medium');
    const newScoreB = scoreB + 1;
    setScoreB(newScoreB);
    setHistory([...history, { scoreA, scoreB: newScoreB }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    hapticFeedback('light');
    const prev = history[history.length - 1];
    setScoreA(prev.scoreA);
    setScoreB(prev.scoreB);
    setHistory(history.slice(0, -1));
  };

  const isGameOver = () => {
    const maxScore = Math.max(scoreA, scoreB);
    const minScore = Math.min(scoreA, scoreB);
    return maxScore >= playTo && maxScore - minScore >= winBy;
  };

  const endGame = async () => {
    if (!isGameOver()) {
      setIsGameEnding(true);
      return;
    }
    const formData = new FormData();
    formData.append("opponentId", selectedOpponent.id.toString());
    formData.append("scoreA", scoreA.toString());
    formData.append("scoreB", scoreB.toString());
    formData.append("playTo", playTo.toString());

    const response = await fetch("/api/matches", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const match = await response.json();
      const won = scoreA > scoreB;
      const eloChange = match.elo_change_a || 0;
      clearSavedMatch();
      setGameResult({ won, eloChange, matchId: match.id });
    }
  };

  const confirmEnd = async () => {
    const formData = new FormData();
    formData.append("opponentId", selectedOpponent.id.toString());
    formData.append("scoreA", scoreA.toString());
    formData.append("scoreB", scoreB.toString());
    formData.append("playTo", playTo.toString());

    const response = await fetch("/api/matches", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const match = await response.json();
      const won = scoreA > scoreB;
      const eloChange = match.elo_change_a || 0;
      clearSavedMatch();
      setGameResult({ won, eloChange, matchId: match.id });
      setIsGameEnding(false);
    }
  };

  if (gameResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <div className={`text-6xl mb-4`}>
            {gameResult.won ? "🏆" : "😔"}
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${gameResult.won ? "text-green-600" : "text-red-600"}`}>
            {gameResult.won ? "Victory!" : "Defeat"}
          </h2>
          <p className="text-gray-600 mb-2 text-xl">
            {scoreA} - {scoreB}
          </p>
          <p className={`text-lg font-semibold mb-6 ${gameResult.eloChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            ELO {gameResult.eloChange >= 0 ? "+" : ""}{gameResult.eloChange}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/dashboard/match/${(gameResult as any).matchId}/photo`)}
              className="w-full h-12 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              📷 Add Photo
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGameEnding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-4">End game now?</h2>
          <p className="text-gray-600 mb-2">Score: {scoreA} - {scoreB}</p>
          <p className="text-sm text-gray-500 mb-6">Game is not complete yet</p>
          <div className="space-y-2">
            <button
              onClick={confirmEnd}
              className="w-full h-12 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Yes, End Game
            </button>
            <button
              onClick={() => setIsGameEnding(false)}
              className="w-full h-12 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-white shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg text-gray-900">{user.name || user.email}</h2>
          <h2 className="font-bold text-lg text-gray-900">{selectedOpponent.name}</h2>
        </div>
        <div className="flex justify-center gap-8 text-6xl font-bold text-gray-900">
          <span>{scoreA}</span>
          <span className="text-gray-400">-</span>
          <span>{scoreB}</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-4 bg-gray-50 flex gap-2 justify-center">
        <button
          onClick={() => setPlayTo(11)}
          className={`h-14 px-6 rounded-lg font-semibold text-lg ${playTo === 11 ? 'bg-green-600 text-white' : 'bg-white text-gray-900 border-2 border-gray-300'}`}
        >
          To 11
        </button>
        <button
          onClick={() => setPlayTo(15)}
          className={`h-14 px-6 rounded-lg font-semibold text-lg ${playTo === 15 ? 'bg-green-600 text-white' : 'bg-white text-gray-900 border-2 border-gray-300'}`}
        >
          To 15
        </button>
        <button
          onClick={() => setPlayTo(21)}
          className={`h-14 px-6 rounded-lg font-semibold text-lg ${playTo === 21 ? 'bg-green-600 text-white' : 'bg-white text-gray-900 border-2 border-gray-300'}`}
        >
          To 21
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Controls */}
      <div className="p-4 bg-white border-t-4 border-gray-300">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <button
            onClick={addPointA}
            className="flex-1 h-20 bg-blue-600 text-white rounded-xl font-bold text-xl active:bg-blue-800 touch-manipulation shadow-lg"
          >
            +1 Me
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="h-20 px-6 bg-gray-800 text-white rounded-xl font-bold disabled:opacity-30 disabled:bg-gray-400 active:bg-black touch-manipulation shadow-lg"
          >
            Undo
          </button>
          <button
            onClick={addPointB}
            className="flex-1 h-20 bg-green-600 text-white rounded-xl font-bold text-xl active:bg-green-800 touch-manipulation shadow-lg"
          >
            +1 Them
          </button>
        </div>
        <button
          onClick={endGame}
          className="w-full h-16 mt-4 bg-red-600 text-white rounded-xl font-bold text-lg active:bg-red-800 touch-manipulation shadow-lg max-w-2xl mx-auto block"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
