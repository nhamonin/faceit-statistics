import database from '#db';

export async function getHighestEloOptions(player_id) {
  const [highestEloMatch] = await database.matches.readAllBy(
    { player_id },
    {
      orderBy: 'elo',
      orderDirection: 'desc',
      limit: 1,
      excludeNull: 'elo',
    }
  );

  return {
    elo: highestEloMatch?.elo,
    date: highestEloMatch?.timestamp,
  };
}
