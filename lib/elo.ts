export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  didWin: boolean,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actualScore = didWin ? 1 : 0;
  return Math.round(kFactor * (actualScore - expectedScore));
}

export function updateElo(
  playerARating: number,
  playerBRating: number,
  playerAWon: boolean
): { newRatingA: number; newRatingB: number; changeA: number; changeB: number } {
  const changeA = calculateEloChange(playerARating, playerBRating, playerAWon);
  const changeB = calculateEloChange(playerBRating, playerARating, !playerAWon);

  return {
    newRatingA: playerARating + changeA,
    newRatingB: playerBRating + changeB,
    changeA,
    changeB,
  };
}
