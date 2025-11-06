import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth();
  const { id } = await params;
  const matchId = parseInt(id);

  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File;

    if (!photo || photo.size === 0) {
      return NextResponse.json(
        { error: "No photo provided" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`matches/${matchId}-${Date.now()}.jpg`, photo, {
      access: "public",
    });

    // Update database
    await db.updateMatchPhoto(matchId, blob.url);

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error(`Error uploading photo for match ${matchId}:`, error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

