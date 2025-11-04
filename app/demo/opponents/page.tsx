"use client";

import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";

const mockOpponents = [
  { id: 1, name: "John Smith", email: "john@example.com", photo_url: null, elo: 1485 },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", photo_url: null, elo: 1550 },
  { id: 3, name: "Mike Chen", email: null, photo_url: null, elo: 1420 },
  { id: 4, name: "Emily Davis", email: "emily@example.com", photo_url: null, elo: 1598 },
];

export default function DemoOpponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Demo Banner */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 mb-6">
          <p className="text-sm text-yellow-900 font-semibold">🎮 Demo Mode - Mock Data</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Opponents</h1>
            <Link href="/demo" className="text-sm text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
          <button
            onClick={() => alert('This is demo mode! Real feature requires database setup.')}
            className="h-12 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            + Add (Demo)
          </button>
        </div>

        <div className="space-y-3">
          {mockOpponents.map((opponent) => (
            <div key={opponent.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <img
                src={getAvatarUrl(opponent.photo_url, opponent.name, opponent.email)}
                alt={opponent.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{opponent.name}</h3>
                {opponent.email && (
                  <p className="text-sm text-gray-600">{opponent.email}</p>
                )}
                <p className="text-sm text-gray-500">ELO: {Math.round(opponent.elo)}</p>
              </div>
              <button
                onClick={() => alert('QR code feature requires database setup')}
                className="h-10 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                QR
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Feature Showcase</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Deterministic avatars (same person = same avatar)</li>
            <li>✅ Email field optional for opponents</li>
            <li>✅ QR code invites for profile claiming</li>
            <li>✅ Mobile-optimized list view</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
