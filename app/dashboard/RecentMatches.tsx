"use client";

import { useState } from "react";
import Link from "next/link";

interface Match {
  id: number;
  player_a_id: number;
  player_a_type: "user" | "opponent";
  player_b_id: number;
  player_b_type: "user" | "opponent";
  score_a: number;
  score_b: number;
  winner_id: number | null;
  winner_type: "user" | "opponent" | null;
  elo_change_a: number | null;
  elo_change_b: number | null;
  played_at: Date;
}

interface Props {
  matches: Match[];
  userId: number;
}

const MATCHES_PER_PAGE = 10;

export default function RecentMatches({ matches, userId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        No matches yet. Start logging your games!
      </div>
    );
  }

  const totalPages = Math.ceil(matches.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const currentMatches = matches.slice(startIndex, endIndex);

  return (
    <>
      <div className="space-y-3">
        {currentMatches.map((match) => {
          const isUserPlayerA = match.player_a_type === "user" && match.player_a_id === userId;
          const userScore = isUserPlayerA ? match.score_a : match.score_b;
          const oppScore = isUserPlayerA ? match.score_b : match.score_a;
          const won = match.winner_id === userId && match.winner_type === "user";
          const eloChange = isUserPlayerA ? match.elo_change_a : match.elo_change_b;

          return (
            <Link
              key={match.id}
              href={`/dashboard/match/${match.id}`}
              className={`block bg-white rounded-xl shadow-sm p-4 border-l-4 hover:shadow-md transition-shadow ${
                won ? "border-green-600" : "border-red-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {won ? "Won" : "Lost"} {userScore}-{oppScore}
                  </div>
                  <div className="text-sm text-gray-600">
                    ELO {eloChange && eloChange > 0 ? "+" : ""}
                    {eloChange}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(match.played_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        Showing {startIndex + 1}-{Math.min(endIndex, matches.length)} of {matches.length} matches
      </p>
    </>
  );
}

