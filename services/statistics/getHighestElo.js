import { Players } from 'faceit-node-api';

import { Player } from '#models';
import { game_id, MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerInfo, getDaysBetweenDates, getHighestEloMatch } from '#utils';

export const getHighestElo = async (playerNickname) => {
  try {
    const players = new Players();
    const playerInDB = await Player.findOne({ nickname: playerNickname });
    let player_id, currentElo, highestElo, highestEloDate;

    if (playerInDB) {
      player_id = playerInDB.player_id;
      currentElo = playerInDB.elo;
      highestElo = playerInDB.highestElo;
      highestEloDate = playerInDB.highestEloDate;
    } else {
      const playerInfo = await getPlayerInfo({
        playerNickname,
      });
      player_id = playerInfo.player_id;
      currentElo = playerInfo.elo;
    }

    if (!player_id)
      return {
        text: 'playerNotExistsError',
        options: { nickname: playerNickname },
      };

    let diffElo = currentElo - highestElo;
    let diffDays = getDaysBetweenDates(highestEloDate, new Date());

    if (highestElo && highestEloDate) {
      return {
        text: `highestElo.${diffElo < 0 ? 'default' : 'peakElo'}`,
        options: {
          nickname: playerNickname,
          highestElo,
          highestEloDate,
          diffElo,
          count: +diffDays,
        },
      };
    }

    const playerStatistics = await players.getStatisticsOfAPlayer(
      player_id,
      game_id
    );
    const playerMatchesAmount = +playerStatistics?.lifetime?.Matches || 0;
    const requestsAmount =
      Math.floor(playerMatchesAmount / MAX_MATCHES_PER_REQUEST) + 1;
    const pages = [...Array(requestsAmount).keys()];
    const highestEloMatch = await getHighestEloMatch(player_id, pages);
    highestElo = highestEloMatch?.elo || currentElo;
    highestEloDate = highestEloMatch?.date
      ? new Date(highestEloMatch?.date)
      : new Date();
    diffElo = currentElo - highestElo;
    diffDays = getDaysBetweenDates(highestEloDate, new Date());

    if (playerInDB) {
      playerInDB.highestElo = highestElo;
      playerInDB.highestEloDate = highestEloDate;
      playerInDB.save();
    }

    return {
      text: `highestElo.${diffElo < 0 ? 'default' : 'peakElo'}`,
      options: {
        nickname: playerNickname,
        highestElo,
        highestEloDate,
        diffElo,
        count: +diffDays,
      },
    };
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
