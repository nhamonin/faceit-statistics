import { Players } from 'faceit-node-api';

import { Player } from '#models';
import { game_id, MAX_MATCHES_PER_REQUEST } from '#config';
import {
  getPlayerInfo,
  getDaysBetweenDates,
  getHighestEloMatch,
  getHighestEloMessage,
} from '#utils';
import strings from '#strings';

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
      return { error: strings.getPlayerLastMatches.notExists(playerNickname) };

    const diffElo = currentElo - highestElo;
    const diffDays = getDaysBetweenDates(highestEloDate, new Date());

    if (highestElo && highestEloDate) {
      return {
        message: getHighestEloMessage(
          playerNickname,
          highestElo,
          highestEloDate,
          diffElo,
          diffDays
        ),
      };
    }

    const playerStatistics = await players.getStatisticsOfAPlayer(
      player_id,
      game_id
    );
    const playerMatchesAmount = +playerStatistics.lifetime.Matches;
    const requestsAmount =
      Math.floor(playerMatchesAmount / MAX_MATCHES_PER_REQUEST) + 1;
    const pages = [...Array(requestsAmount).keys()];
    const highestEloMatch = await getHighestEloMatch(player_id, pages);
    highestElo = highestEloMatch.elo;
    highestEloDate = new Date(highestEloMatch.date);

    if (playerInDB) {
      playerInDB.highestElo = highestElo;
      playerInDB.highestEloDate = highestEloDate;
      playerInDB.save();
    }

    return {
      message: getHighestEloMessage(
        playerNickname,
        highestElo,
        highestEloDate,
        diffElo,
        diffDays
      ),
    };
  } catch (e) {
    console.log(e.message);
    return strings.serverError;
  }
};
