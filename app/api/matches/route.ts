import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { updateElo } from "@/lib/elo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

  // Determine winner
  const userWon = scoreA > scoreB;
  const winnerId = userWon ? session.user.id : opponentId;
  const winnerType = userWon ? "user" : "opponent";

  // Calculate ELO changes
  const userElo = session.user.elo;
  const opponentElo = opponent.elo;
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
}
