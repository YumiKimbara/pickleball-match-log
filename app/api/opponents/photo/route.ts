import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { rateLimit, RateLimits } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const formData = await request.formData();
    const photo = formData.get("photo") as File;
    const opponentId = parseInt(formData.get("opponentId") as string);

    if (!photo || !opponentId) {
      return NextResponse.json(
        { error: "Missing photo or opponent ID" },
        { status: 400 }
      );
    }

    // Verify opponent exists and belongs to user (or user is admin)
    const opponent = await db.getOpponentById(opponentId);
    if (!opponent || (opponent.created_by_user_id !== session.user.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: "Opponent not found or access denied" },
        { status: 404 }
      );
    }

    let photoUrl: string | null = null;

    // Upload to Vercel Blob if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`opponents/${Date.now()}-${photo.name}`, photo, {
          access: "public",
        });
        photoUrl = blob.url;
      } catch (error) {
        console.error("Failed to upload to Vercel Blob:", error);
        return NextResponse.json(
          { error: "Photo upload failed. Please configure Vercel Blob storage." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Vercel Blob storage not configured" },
        { status: 503 }
      );
    }

    // Update opponent with new photo URL
    await db.updateOpponentPhoto(opponentId, photoUrl);

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opponentId } = await request.json();

    if (!opponentId) {
      return NextResponse.json(
        { error: "Missing opponent ID" },
        { status: 400 }
      );
    }

    // Verify opponent exists and belongs to user (or user is admin)
    const opponent = await db.getOpponentById(opponentId);
    if (!opponent || (opponent.created_by_user_id !== session.user.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: "Opponent not found or access denied" },
        { status: 404 }
      );
    }

    // Remove photo URL
    await db.updateOpponentPhoto(opponentId, null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Photo removal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
