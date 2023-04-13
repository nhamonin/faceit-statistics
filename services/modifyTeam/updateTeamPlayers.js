import database from '#db';
import { getPlayerInfo, cacheWithExpiry, withErrorHandling } from '#utils';
import { getHighestElo } from '#services';
import { caches } from '#config';

export const updateTeamPlayers = async (chat_id) =>
  withErrorHandling(
    async () => {
      const addedToCache = cacheWithExpiry(
        caches.updateTeamPlayers,
        chat_id,
        1000 * 60
      );
      if (!addedToCache) return;
      const team = await database.teams.readBy({ chat_id });
      if (!team) return { text: 'teamNotExistError' };
      const teamPlayerIDs = (
        await database.players.readAllByChatId(chat_id)
      ).map(({ player_id }) => player_id);
      const playersStats = await Promise.all(
        teamPlayerIDs.map((player_id) => getPlayerInfo({ playerID: player_id }))
      );
      for await (const {
        player_id,
        nickname,
        elo,
        lvl,
        kd,
        avg,
        hs,
        winrate,
      } of playersStats) {
        await database.players.updateAllBy(
          { player_id },
          { nickname, elo, lvl, kd, avg, hs, winrate }
        );

        const updatedPlayer = await database.players.readBy({ player_id });
        const { elo: updatedElo, highestElo, highestEloDate } = updatedPlayer;

        await getHighestElo(nickname);

        if (highestElo && highestEloDate && updatedElo >= highestElo) {
          await database.players.updateAllBy(
            { player_id },
            { highestElo: updatedElo, highestEloDate: new Date() }
          );
        }
      }

      return { text: 'updateTeamPlayers.success' };
    },
    {
      errorMessage: 'updateTeamPlayers.error',
    }
  )();
