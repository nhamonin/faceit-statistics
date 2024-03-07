export function calculateLifeTimeWinrate(stats) {
  const neededSegment = stats?.segments?.filter(
    (segment) => segment._id.segmentId === 'csgo_map'
  )?.[0]?.segments;

  if (!neededSegment) return 0;

  let totalWins = 0;
  let totalGames = 0;

  Object.values(neededSegment).forEach((map) => {
    const wins = parseInt(map.m2, 10);
    const games = parseInt(map.m1, 10);
    if (!isNaN(wins) && !isNaN(games)) {
      totalWins += wins;
      totalGames += games;
    }
  });

  if (totalGames === 0) return 0;

  const winrate = (totalWins / totalGames) * 100;
  return winrate.toFixed(2);
}
