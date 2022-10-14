export function extractPlayerStatsFromMatches(playersModels, matchesStats) {
  return matchesStats.map((playerMatchesStats, index) =>
    playerMatchesStats.map((matchStats) => {
      const players = [
        ...matchStats.teams[0].players,
        ...matchStats.teams[1].players,
      ];
      return players.filter(
        (player) => player.player_id === playersModels[index].player_id
      )[0];
    })
  );
}
