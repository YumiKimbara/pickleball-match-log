'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Opponent {
  id: number;
  name: string;
  email: string | null;
  elo: number;
  photo_url: string | null;
  user_id: number | null;
  created_by_user_id: number | null;
  linked_user_email?: string | null;
}

export default function AdminOpponentsPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchOpponents();
  }, []);

  async function fetchOpponents() {
    try {
      const res = await fetch('/api/admin/opponents');
      const data = await res.json();
      setOpponents(data.opponents || []);
    } catch (error) {
      console.error('Failed to fetch opponents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete opponent "${name}"? This will remove all their matches.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/opponents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setOpponents(opponents.filter(o => o.id !== id));
      } else {
        alert('Failed to delete opponent');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete opponent');
    }
  }

  async function handleUpdate(id: number) {
    try {
      const res = await fetch('/api/admin/opponents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          name: editForm.name, 
          email: editForm.email || null 
        }),
      });

      if (res.ok) {
        // Refresh the entire list to get updated data including linked_user_email
        await fetchOpponents();
        setEditingId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update opponent');
      }
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update opponent');
    }
  }

  function startEdit(opponent: Opponent) {
    setEditingId(opponent.id);
    setEditForm({ 
      name: opponent.name, 
      email: opponent.email || '' 
    });
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
        <h1 className="text-3xl font-bold">Opponent Management</h1>
        <p className="text-gray-600 mt-2">
          {opponents.length} opponents total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ELO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opponents.map((opponent) => (
              <tr key={opponent.id} className="hover:bg-gray-50">
                {editingId === opponent.id ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {opponent.id}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="(optional)"
                        disabled={!!opponent.user_id}
                        title={opponent.user_id ? "Cannot edit email for linked opponents" : ""}
                      />
                      {opponent.user_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Linked - email from user account
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {Math.round(Number(opponent.elo))}
                    </td>
                    <td className="px-6 py-4">
                      {opponent.user_id ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Linked
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleUpdate(opponent.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {opponent.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {opponent.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {opponent.linked_user_email ? (
                        <span className="text-green-600 font-medium">{opponent.linked_user_email}</span>
                      ) : (
                        opponent.email || '(none)'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {Math.round(Number(opponent.elo))}
                    </td>
                    <td className="px-6 py-4">
                      {opponent.user_id ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Linked
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => startEdit(opponent)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(opponent.id, opponent.name)}
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

        {opponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No opponents found
          </div>
        )}
      </div>
    </div>
  );
}

