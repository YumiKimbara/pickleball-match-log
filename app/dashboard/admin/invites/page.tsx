'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface InviteToken {
  id: number;
  token: string;
  opponent_id: number | null;
  created_by_user_id: number;
  expires_at: string;
  redeemed_at: string | null;
  redeemed_by_user_id: number | null;
  created_at: string;
}

export default function AdminInvitesPage() {
  const [tokens, setTokens] = useState<InviteToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    try {
      const res = await fetch('/api/admin/invites');
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExpire(id: number) {
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchInvites(); // Refresh list
      } else {
        alert('Failed to expire invite');
      }
    } catch (error) {
      console.error('Failed to expire:', error);
      alert('Failed to expire invite');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this invite token?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setTokens(tokens.filter(t => t.id !== id));
      } else {
        alert('Failed to delete invite');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete invite');
    }
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const activeTokens = tokens.filter(t => !isExpired(t.expires_at) && !t.redeemed_at);
  const expiredTokens = tokens.filter(t => isExpired(t.expires_at) || t.redeemed_at);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/admin"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Invite Token Management</h1>
        <p className="text-gray-600 mt-2">
          {activeTokens.length} active, {expiredTokens.length} expired/redeemed
        </p>
      </div>

      {/* Active Tokens */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Invites</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Opponent ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {token.token.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {token.opponent_id || '(none)'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(token.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(token.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleExpire(token.id)}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      Expire
                    </button>
                    <button
                      onClick={() => handleDelete(token.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeTokens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active invites
            </div>
          )}
        </div>
      </div>

      {/* Expired/Redeemed Tokens */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Expired/Redeemed Invites</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expiredTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">
                    {token.token.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    {token.redeemed_at ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Redeemed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(token.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleDelete(token.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {expiredTokens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No expired/redeemed invites
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

