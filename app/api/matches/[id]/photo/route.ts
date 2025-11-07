import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { rateLimit, RateLimits } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const matchId = parseInt(id);

  // Rate limit photo uploads
  const rateLimitResult = rateLimit({
    identifier: `photo:${session.user.id}`,
    ...RateLimits.PHOTO_UPLOAD,
  });

  if (!rateLimitResult.success) {
    const resetIn = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000 / 60);
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${resetIn} minutes.` },
      { status: 429 }
    );
  }

  try {
    // Verify user owns this match
    const match = await db.getMatchById(matchId);
    if (!match || match.logged_by_user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Match not found or access denied" },
        { status: 404 }
      );
    }

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

