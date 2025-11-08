import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewOpponentPage() {
  const session = await requireAuth();

  async function createOpponent(formData: FormData) {
    "use server";

    try {
      const session = await requireAuth();
      const name = formData.get("name") as string;
      const email = (formData.get("email") as string) || null;

      await db.createOpponent(name, email, session.user.id, null);
    } catch (error) {
      console.error("Failed to create opponent:", error);
      throw error;
    }
    
    redirect("/dashboard/opponents");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Add Opponent</h1>
          <Link href="/dashboard/opponents" className="text-sm text-blue-600 hover:underline">
            ← Back to Opponents
          </Link>
        </div>

        <form action={createOpponent} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter opponent's name"
              required
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Email (optional)</label>
            <input
              type="email"
              name="email"
              placeholder="opponent@email.com"
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg transition-all"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>If provided, they can claim this profile via QR invite</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-16 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 active:bg-green-800 shadow-lg transition-all"
          >
            Create Opponent
          </button>
        </form>
      </div>
    </div>
  );
}
