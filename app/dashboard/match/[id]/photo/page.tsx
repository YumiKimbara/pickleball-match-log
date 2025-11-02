import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { redirect } from "next/navigation";

export default async function MatchPhotoPage({ params }: { params: { id: string } }) {
  await requireAuth();
  const matchId = parseInt(params.id);

  async function uploadPhoto(formData: FormData) {
    "use server";

    const photo = formData.get("photo") as File;
    if (photo && photo.size > 0) {
      const blob = await put(`matches/${matchId}-${Date.now()}.jpg`, photo, {
        access: "public",
      });
      await db.updateMatchPhoto(matchId, blob.url);
    }
    redirect("/dashboard");
  }

  async function skipPhoto() {
    "use server";
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Add a photo?</h1>
        <p className="text-gray-600 mb-6">Capture this moment with your opponent!</p>

        <form action={uploadPhoto} className="space-y-4">
          <input
            type="file"
            name="photo"
            accept="image/*"
            capture="environment"
            className="w-full"
          />
          <button
            type="submit"
            className="w-full h-12 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Upload Photo
          </button>
        </form>

        <form action={skipPhoto}>
          <button
            type="submit"
            className="w-full h-12 mt-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Skip
          </button>
        </form>
      </div>
    </div>
  );
}
