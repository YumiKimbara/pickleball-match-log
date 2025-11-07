"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Match {
  id: number;
  player_a_id: number;
  player_a_type: 'user' | 'opponent';
  player_b_id: number;
  player_b_type: 'user' | 'opponent';
  score_a: number;
  score_b: number;
  winner_id: number | null;
  winner_type: 'user' | 'opponent' | null;
  played_at: string;
  logged_by_user_id: number | null;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ scoreA: 0, scoreB: 0 });

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const res = await fetch('/api/admin/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(`Delete this match? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/matches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMatches(matches.filter(m => m.id !== id));
      } else {
        alert('Failed to delete match');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete match');
    }
  }

  async function handleUpdate(id: number) {
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          scoreA: editForm.scoreA,
          scoreB: editForm.scoreB,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchMatches(); // Refresh list
      } else {
        alert('Failed to update match');
      }
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update match');
    }
  }

  function startEdit(match: Match) {
    setEditingId(match.id);
    setEditForm({
      scoreA: match.score_a,
      scoreB: match.score_b,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Match Management</h1>
        <Link href="/dashboard/admin" className="text-blue-600 hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player A</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player B</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Played At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                {editingId === match.id ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">{match.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {match.player_a_type === 'user' ? 'User' : 'Opp'} #{match.player_a_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editForm.scoreA}
                          onChange={(e) => setEditForm({ ...editForm, scoreA: parseInt(e.target.value) })}
                          className="w-16 px-2 py-1 border rounded"
                          min="0"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={editForm.scoreB}
                          onChange={(e) => setEditForm({ ...editForm, scoreB: parseInt(e.target.value) })}
                          className="w-16 px-2 py-1 border rounded"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {match.player_b_type === 'user' ? 'User' : 'Opp'} #{match.player_b_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(match.played_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleUpdate(match.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{match.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        {match.player_a_type === 'user' ? '👤 User' : '🎯 Opponent'} #{match.player_a_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {match.score_a} - {match.score_b}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        {match.player_b_type === 'user' ? '👤 User' : '🎯 Opponent'} #{match.player_b_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {match.winner_id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {match.winner_type === 'user' ? '👤' : '🎯'} #{match.winner_id}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(match.played_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => startEdit(match)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(match.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {matches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No matches found
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>⚠️ Note:</strong> Editing scores does not recalculate ELO ratings. 
          Use the "Recalculate All ELO" button on the admin dashboard to update ratings after editing matches.
        </p>
      </div>
    </div>
  );
}

