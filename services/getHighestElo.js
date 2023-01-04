import { Players } from 'faceit-node-api';
import { messages, game_id } from '#config';
import { getPlayerInfo, getPlayerMatches } from '#utils';

const players = new Players();
const MAX_MATCHES_PER_REQUEST = 2000;

export const getHighestElo = async (playerNickname) => {
  try {
    const { player_id, elo: currentElo } = await getPlayerInfo({
      playerNickname,
    });
    if (!player_id)
      return { error: messages.getPlayerLastMatches.notExists(playerNickname) };
    const playerDetails = await players.getStatisticsOfAPlayer(
      player_id,
      game_id
    );
    const playerMatchesAmount = +playerDetails.lifetime.Matches;
    const requestsAmount =
      Math.floor(playerMatchesAmount / MAX_MATCHES_PER_REQUEST) + 1;
    const pages = [...Array(requestsAmount).keys()];
    const [highestEloMatch] = await Promise.all(
      pages.map((page) => getPlayerMatches(player_id, 2000, page))
    ).then((arr) =>
      arr
        .flat()
        .filter(({ elo }) => elo)
        .sort((a, b) => b.elo - a.elo)
    );

    const date = new Date(highestEloMatch.date).toLocaleDateString('en-us');

    return {
      message: `<b>${playerNickname}</b>'s highest elo was <b>${
        highestEloMatch.elo
      }</b> (${
        currentElo - highestEloMatch.elo
      } from now).\nDate when the highest elo was reached: ${date}.`,
    };
  } catch (e) {
    console.log(e.message);
    return messages.serverError;
  }
};
