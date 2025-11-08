'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  elo: number;
}

interface Opponent {
  id: number;
  name: string;
  email: string | null;
  elo: number;
}

interface DuplicateUsers {
  key: string;
  users: User[];
}

interface DuplicateOpponents {
  key: string;
  opponents: Opponent[];
}

export default function AdminDuplicatesPage() {
  const [duplicateUsers, setDuplicateUsers] = useState<DuplicateUsers[]>([]);
  const [duplicateOpponents, setDuplicateOpponents] = useState<DuplicateOpponents[]>([]);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  async function fetchDuplicates() {
    try {
      const res = await fetch('/api/admin/duplicates');
      const data = await res.json();
      setDuplicateUsers(data.users || []);
      setDuplicateOpponents(data.opponents || []);
    } catch (error) {
      console.error('Failed to fetch duplicates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function mergeUsers(keepId: number, deleteId: number) {
    if (!confirm(`Merge user ${deleteId} into user ${keepId}? This cannot be undone.`)) {
      return;
    }

    setMerging(true);
    try {
      const res = await fetch('/api/admin/users/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepId, deleteId }),
      });

      if (res.ok) {
        alert('Users merged successfully');
        fetchDuplicates();
      } else {
        const data = await res.json();
        alert(`Failed to merge: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to merge:', error);
      alert('Failed to merge users');
    } finally {
      setMerging(false);
    }
  }

  async function mergeOpponents(keepId: number, deleteId: number) {
    if (!confirm(`Merge opponent ${deleteId} into opponent ${keepId}? This cannot be undone.`)) {
      return;
    }

    setMerging(true);
    try {
      const res = await fetch('/api/admin/opponents/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepId, deleteId }),
      });

      if (res.ok) {
        alert('Opponents merged successfully');
        fetchDuplicates();
      } else {
        const data = await res.json();
        alert(`Failed to merge: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to merge:', error);
      alert('Failed to merge opponents');
    } finally {
      setMerging(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/admin"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Duplicate Detection</h1>
        <p className="text-gray-600 mt-2">
          Found {duplicateUsers.length} duplicate user groups and {duplicateOpponents.length} duplicate opponent groups
        </p>
      </div>

      {/* Duplicate Users */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Duplicate Users</h2>
        {duplicateUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No duplicate users found
          </div>
        ) : (
          <div className="space-y-4">
            {duplicateUsers.map((group, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3 text-lg">
                  {group.key}
                </h3>
                <div className="space-y-2">
                  {group.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border rounded p-3 bg-gray-50">
                      <div>
                        <p className="font-medium">ID: {user.id} - {user.name || '(no name)'}</p>
                        <p className="text-sm text-gray-600">ELO: {Math.round(user.elo)} | Role: {user.role}</p>
                      </div>
                      {group.users.length > 1 && (
                        <div className="space-x-2">
                          {group.users.filter(u => u.id !== user.id).map(otherUser => (
                            <button
                              key={`merge-${user.id}-${otherUser.id}`}
                              onClick={() => mergeUsers(user.id, otherUser.id)}
                              disabled={merging}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              ← Merge {otherUser.id} into this
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate Opponents */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Duplicate Opponents</h2>
        {duplicateOpponents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No duplicate opponents found
          </div>
        ) : (
          <div className="space-y-4">
            {duplicateOpponents.map((group, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3 text-lg">
                  Similar: {group.opponents[0]?.name || group.key}
                </h3>
                <div className="space-y-2">
                  {group.opponents.map((opponent) => (
                    <div key={opponent.id} className="flex items-center justify-between border rounded p-3 bg-gray-50">
                      <div>
                        <p className="font-medium">ID: {opponent.id} - {opponent.name}</p>
                        <p className="text-sm text-gray-600">
                          ELO: {Math.round(opponent.elo)} 
                          {opponent.email && ` | Email: ${opponent.email}`}
                        </p>
                      </div>
                      {group.opponents.length > 1 && (
                        <div className="space-x-2">
                          {group.opponents.filter(o => o.id !== opponent.id).map(otherOpponent => (
                            <button
                              key={`merge-${opponent.id}-${otherOpponent.id}`}
                              onClick={() => mergeOpponents(opponent.id, otherOpponent.id)}
                              disabled={merging}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              ← Merge {otherOpponent.id} into this
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Merging is permanent and will transfer all matches, 
          opponents, and invite tokens from the deleted entity to the kept entity.
        </p>
      </div>
    </div>
  );
}

