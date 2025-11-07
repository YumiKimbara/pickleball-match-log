'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function FixMyRolePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleFix() {
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/admin/fix-my-role', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        // Auto sign out after 2 seconds
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/signin' });
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to fix role');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to fix role');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Fix Admin Role</h1>
        
        <p className="text-gray-600 mb-6">
          If you signed in as <code className="bg-gray-100 px-2 py-1 rounded">a13158y@gmail.com</code> but 
          your role shows as "user" instead of "admin", click the button below to fix it.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleFix}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Fix My Role to Admin
          </button>
        )}

        {status === 'loading' && (
          <div className="text-center py-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Updating role...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">✓ Success!</p>
            <p className="text-green-700 text-sm mt-1">{message}</p>
            <p className="text-green-600 text-sm mt-2">Signing you out...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">✗ Error</p>
            <p className="text-red-700 text-sm mt-1">{message}</p>
            <button
              onClick={handleFix}
              className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

