import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/avatar";
import Link from "next/link";
import OpponentCard from "./OpponentCard";

export default async function OpponentsPage() {
  const session = await requireAuth();

  const opponents = session.user.role === 'admin'
    ? await db.getAllOpponents()
    : await db.getOpponentsByCreator(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Opponents</h1>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
          <Link
            href="/dashboard/opponents/new"
            className="h-12 px-6 bg-green-600 text-white rounded-lg font-semibold inline-flex items-center hover:bg-green-700"
          >
            + Add
          </Link>
        </div>

        {opponents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No opponents yet. Add your first opponent to start logging matches!
          </div>
        ) : (
          <div className="space-y-3">
            {opponents.map((opponent) => (
              <OpponentCard
                key={opponent.id}
                opponent={opponent}
                avatarUrl={getAvatarUrl(opponent.photo_url, opponent.name, opponent.email)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
