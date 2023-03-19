import { MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerMatches } from '#utils';

export async function getHighestEloMatch(player_id, pages) {
  const [highestEloMatch] = await Promise.all(
    pages.map((page) =>
      getPlayerMatches(player_id, MAX_MATCHES_PER_REQUEST, page)
    )
  ).then((arr) =>
    arr
      .flat()
      .filter(({ elo }) => elo)
      .sort((a, b) => b.elo - a.elo)
  );

  return highestEloMatch;
}
