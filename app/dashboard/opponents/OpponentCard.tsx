"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoUploadModal from "./PhotoUploadModal";

interface OpponentCardProps {
  opponent: {
    id: number;
    name: string;
    email: string | null;
    photo_url: string | null;
    elo: number;
  };
  avatarUrl: string;
}

export default function OpponentCard({ opponent, avatarUrl }: OpponentCardProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <button
          onClick={() => setShowPhotoModal(true)}
          className="relative group"
          title="Click to update photo"
        >
          <img
            src={avatarUrl}
            alt={opponent.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-green-500 transition-all"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full flex items-center justify-center transition-all">
            <svg
              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{opponent.name}</h3>
          {opponent.email && (
            <p className="text-sm text-gray-600 truncate">{opponent.email}</p>
          )}
          <p className="text-sm font-medium text-green-600">
            ELO: {Math.round(opponent.elo)}
          </p>
        </div>

        <Link
          href={`/dashboard/opponents/${opponent.id}/qr`}
          className="h-11 px-5 bg-blue-600 text-white rounded-xl font-semibold inline-flex items-center hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow-md"
        >
          QR
        </Link>
      </div>

      {showPhotoModal && (
        <PhotoUploadModal
          opponentId={opponent.id}
          opponentName={opponent.name}
          currentPhotoUrl={opponent.photo_url}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </>
  );
}
