"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoMatchPage() {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [playTo, setPlayTo] = useState(11);
  const [history, setHistory] = useState<{ scoreA: number; scoreB: number }[]>([]);

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

  const endGame = () => {
    alert(`Demo Mode: Match ended ${scoreA}-${scoreB}\n\nIn the real app, this would:\n- Calculate ELO changes\n- Save to database\n- Prompt for post-match photo`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b-2 border-yellow-400 p-2 text-center">
        <p className="text-sm text-yellow-900 font-semibold">🎮 Demo Mode</p>
      </div>

      {/* Header */}
      <div className="p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">You</h2>
          <h2 className="font-semibold">Opponent</h2>
        </div>
        <div className="flex justify-center gap-8 text-5xl font-bold">
          <span className="text-blue-600">{scoreA}</span>
          <span className="text-gray-400">-</span>
          <span className="text-green-600">{scoreB}</span>
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

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border-y border-blue-200">
        <p className="text-sm text-blue-900 text-center">
          ✨ <strong>One-handed scoring:</strong> Large buttons optimized for thumb use on mobile
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Controls */}
      <div className="p-4 bg-white border-t-2 border-gray-200">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <button
            onClick={addPointA}
            className="flex-1 h-16 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 touch-manipulation shadow-lg"
          >
            +1 Me
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="h-16 px-6 bg-gray-200 text-gray-800 rounded-xl font-bold disabled:opacity-50 active:bg-gray-300 touch-manipulation shadow-lg"
          >
            Undo
          </button>
          <button
            onClick={addPointB}
            className="flex-1 h-16 bg-green-600 text-white rounded-xl font-bold text-lg active:bg-green-700 touch-manipulation shadow-lg"
          >
            +1 Them
          </button>
        </div>
        <button
          onClick={endGame}
          className="w-full h-14 mt-4 bg-red-600 text-white rounded-xl font-bold active:bg-red-700 touch-manipulation max-w-2xl mx-auto block shadow-lg"
        >
          End Game
        </button>
        <Link
          href="/demo"
          className="block text-center mt-3 text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
