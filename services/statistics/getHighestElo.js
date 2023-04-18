import database from '#db';
import {
  getPlayerInfo,
  getDaysBetweenDates,
  getHighestEloOptions,
  withErrorHandling,
} from '#utils';

export const getHighestElo = async (nickname) =>
  withErrorHandling(
    async () => {
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

      const highestEloOptions = await getHighestEloOptions(player_id);
      highestElo = highestEloOptions?.elo || currentElo;
      highestEloDate = highestEloOptions?.date || new Date();
      diffElo = currentElo - highestElo;
      diffDays = getDaysBetweenDates(highestEloDate, new Date());

      if (playerInDB) {
        playerInDB.highestElo = highestElo;
        playerInDB.highestEloDate = highestEloDate;
        await database.players.updateAllBy({ player_id }, playerInDB);
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
    },
    {
      errorMessage: 'serverError',
    }
  )();
