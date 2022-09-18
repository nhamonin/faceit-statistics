export default async function getCSGOStats(csgoGames) {
  return await Promise.all(csgoGames.map((csgoGame) => csgoGame.getStats()));
}
