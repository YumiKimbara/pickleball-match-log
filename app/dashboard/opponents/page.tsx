import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/avatar";
import Link from "next/link";

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
                <Link
                  href={`/dashboard/opponents/${opponent.id}/qr`}
                  className="h-10 px-4 bg-blue-600 text-white rounded-lg font-medium inline-flex items-center hover:bg-blue-700"
                >
                  QR
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
