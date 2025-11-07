import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewOpponentPage() {
  const session = await requireAuth();

  async function createOpponent(formData: FormData) {
    "use server";

    const session = await requireAuth();
    const name = formData.get("name") as string;
    const email = (formData.get("email") as string) || null;
    const photo = formData.get("photo") as File | null;

    let photoUrl: string | null = null;

    // Only attempt photo upload if Vercel Blob is configured
    if (photo && photo.size > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`opponents/${Date.now()}-${photo.name}`, photo, {
          access: "public",
        });
        photoUrl = blob.url;
      } catch (error) {
        console.error("Failed to upload photo:", error);
        // Continue without photo
      }
    }

    await db.createOpponent(name, email, session.user.id, photoUrl);
    redirect("/dashboard/opponents");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Add Opponent</h1>
          <Link href="/dashboard/opponents" className="text-sm text-blue-600 hover:underline">
            ← Back to Opponents
          </Link>
        </div>

        <form action={createOpponent} className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Email (optional)</label>
            <input
              type="email"
              name="email"
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, they can claim this profile via QR invite
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">📷 Photo (optional)</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              capture="environment"
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 active:bg-green-800 shadow-lg"
          >
            Create Opponent
          </button>
        </form>
      </div>
    </div>
  );
}
