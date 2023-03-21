import { getHighAmountOfPlayerLastMatches } from '#utils';

export async function getHighestEloMatch(
  player_id,
  matches,
  nickname,
  chat_id
) {
  const allMatches = await getHighAmountOfPlayerLastMatches(
    player_id,
    matches,
    nickname,
    chat_id
  );

  const highestEloMatch = allMatches
    .filter(({ elo }) => elo)
    .sort((a, b) => b.elo - a.elo)[0];

  return highestEloMatch;
}
