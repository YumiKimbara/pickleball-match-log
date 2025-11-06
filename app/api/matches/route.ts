import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { updateElo } from "@/lib/elo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();

    const opponentId = parseInt(formData.get("opponentId") as string);
    const scoreA = parseInt(formData.get("scoreA") as string);
    const scoreB = parseInt(formData.get("scoreB") as string);
    const playTo = parseInt(formData.get("playTo") as string);
    const winBy = 2;

    const opponent = await db.getOpponentById(opponentId);
    if (!opponent) {
      return NextResponse.json({ error: "Opponent not found" }, { status: 404 });
    }

    // Get current user data for fresh ELO (session ELO is stale)
    const currentUser = await db.getUserById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine winner
    const userWon = scoreA > scoreB;
    const winnerId = userWon ? session.user.id : opponentId;
    const winnerType = userWon ? "user" : "opponent";

    // Calculate ELO changes using CURRENT ELO from database
    const userElo = Number(currentUser.elo);
    const opponentElo = Number(opponent.elo);
    const { newRatingA, newRatingB, changeA, changeB } = updateElo(userElo, opponentElo, userWon);

    // Create match
    const match = await db.createMatch({
      playerAId: session.user.id,
      playerAType: "user",
      playerBId: opponentId,
      playerBType: "opponent",
      scoreA,
      scoreB,
      playTo,
      winBy,
      winnerId,
      winnerType,
      eloChangeA: changeA,
      eloChangeB: changeB,
      loggedByUserId: session.user.id,
    });

    // Update ELOs
    await db.updateUserElo(session.user.id, newRatingA);
    await db.updateOpponentElo(opponentId, newRatingB);

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
