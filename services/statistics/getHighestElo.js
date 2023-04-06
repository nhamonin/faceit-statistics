import { Players } from 'faceit-node-api';

import database from '#db';
import { game_id } from '#config';
import { getPlayerInfo, getDaysBetweenDates, getHighestEloMatch } from '#utils';

export const getHighestElo = async (nickname, chat_id) => {
  try {
    const players = new Players();
    const playerInDB = await database.players.readBy({ nickname });
    let player_id, currentElo, highestElo, highestEloDate;

    if (playerInDB) {
      player_id = playerInDB.player_id;
      currentElo = playerInDB.elo;
      highestElo = playerInDB.highestElo;
      highestEloDate = playerInDB.highestEloDate;
    } else {
      const playerInfo = await getPlayerInfo({
        playerNickname: nickname,
      });
      player_id = playerInfo.player_id;
      currentElo = playerInfo.elo;
    }

    if (!player_id)
      return {
        text: 'playerNotExistsError',
        options: { nickname },
      };

    let diffElo = currentElo - highestElo;
    let diffDays = getDaysBetweenDates(highestEloDate, new Date());

    if (highestElo && highestEloDate) {
      return {
        text: `highestElo.${diffElo < 0 ? 'default' : 'peakElo'}`,
        options: {
          nickname,
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
    const highestEloMatch = await getHighestEloMatch(
      player_id,
      playerMatchesAmount,
      nickname,
      chat_id
    );
    highestElo = highestEloMatch?.elo || currentElo;
    highestEloDate = highestEloMatch?.date
      ? new Date(highestEloMatch?.date)
      : new Date();
    diffElo = currentElo - highestElo;
    diffDays = getDaysBetweenDates(highestEloDate, new Date());

    if (playerInDB) {
      playerInDB.highestElo = highestElo;
      playerInDB.highestEloDate = highestEloDate;
      await database.players.update(playerInDB);
    }

    return {
      text: `highestElo.${diffElo < 0 ? 'default' : 'peakElo'}`,
      options: {
        nickname,
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
