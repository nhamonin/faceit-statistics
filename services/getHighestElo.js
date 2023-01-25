import { Players } from 'faceit-node-api';
import { messages, game_id } from '#config';
import { getPlayerInfo, getPlayerMatches } from '#utils';

const MAX_MATCHES_PER_REQUEST = 2000;

export const getHighestElo = async (playerNickname) => {
  const players = new Players();
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

    const highestEloDate = new Date(highestEloMatch.date);
    const highestEloDateLocalized = highestEloDate.toLocaleDateString('en-us');
    const currentDate = new Date();
    const diffDays = parseInt(
      (currentDate - highestEloDate) / (1000 * 60 * 60 * 24),
      10
    );
    const message =
      currentElo - highestEloMatch.elo < 0
        ? `<b>${playerNickname}</b>'s highest elo was <b>${
            highestEloMatch.elo
          }</b> (${
            currentElo - highestEloMatch.elo
          } from now).\nDate when the highest elo was reached: ${highestEloDateLocalized} (${diffDays} days ago).`
        : `<b>${playerNickname}</b>'s highest elo: <b>${currentElo}</b>.\nDate when the highest elo was reached: ${date}.`;

    return {
      message,
    };
  } catch (e) {
    console.log(e.message);
    return messages.serverError;
  }
};
