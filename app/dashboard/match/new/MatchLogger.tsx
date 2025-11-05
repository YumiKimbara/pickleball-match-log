"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Opponent {
  id: number;
  name: string;
  photo_url: string | null;
}

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
}

export default function MatchLogger({ user, opponents }: { user: User; opponents: Opponent[] }) {
  const router = useRouter();
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [scoreA, setScoreA] = useState(0); // User's score
  const [scoreB, setScoreB] = useState(0); // Opponent's score
  const [playTo, setPlayTo] = useState(11);
  const [winBy] = useState(2);
  const [history, setHistory] = useState<{ scoreA: number; scoreB: number }[]>([]);
  const [isGameEnding, setIsGameEnding] = useState(false);
  const [gameResult, setGameResult] = useState<{ won: boolean; eloChange: number } | null>(null);

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
          <div className="space-y-2">
            {opponents.map((opp) => (
              <button
                key={opp.id}
                onClick={() => setSelectedOpponent(opp)}
                className="w-full h-16 bg-white rounded-xl shadow-sm px-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100"
              >
                <span className="font-semibold">{opp.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const addPointA = () => {
    const newScoreA = scoreA + 1;
    setScoreA(newScoreA);
    setHistory([...history, { scoreA: newScoreA, scoreB }]);
  };

  const addPointB = () => {
    const newScoreB = scoreB + 1;
    setScoreB(newScoreB);
    setHistory([...history, { scoreA, scoreB: newScoreB }]);
  };

  const undo = () => {
    if (history.length === 0) return;
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
      setGameResult({ won, eloChange });
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
      setGameResult({ won, eloChange });
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
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
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
      <div className="p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">{user.name || user.email}</h2>
          <h2 className="font-semibold">{selectedOpponent.name}</h2>
        </div>
        <div className="flex justify-center gap-8 text-5xl font-bold">
          <span>{scoreA}</span>
          <span className="text-gray-400">-</span>
          <span>{scoreB}</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-4 bg-gray-50 flex gap-2 justify-center">
        <button
          onClick={() => setPlayTo(11)}
          className={`px-4 py-2 rounded-lg font-medium ${playTo === 11 ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          To 11
        </button>
        <button
          onClick={() => setPlayTo(15)}
          className={`px-4 py-2 rounded-lg font-medium ${playTo === 15 ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          To 15
        </button>
        <button
          onClick={() => setPlayTo(21)}
          className={`px-4 py-2 rounded-lg font-medium ${playTo === 21 ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          To 21
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Controls */}
      <div className="p-4 bg-white border-t-2 border-gray-200">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <button
            onClick={addPointA}
            className="flex-1 h-16 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 touch-manipulation"
          >
            +1 Me
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="h-16 px-6 bg-gray-200 text-gray-800 rounded-xl font-bold disabled:opacity-50 active:bg-gray-300 touch-manipulation"
          >
            Undo
          </button>
          <button
            onClick={addPointB}
            className="flex-1 h-16 bg-green-600 text-white rounded-xl font-bold text-lg active:bg-green-700 touch-manipulation"
          >
            +1 Them
          </button>
        </div>
        <button
          onClick={endGame}
          className="w-full h-14 mt-4 bg-red-600 text-white rounded-xl font-bold active:bg-red-700 touch-manipulation max-w-2xl mx-auto block"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
