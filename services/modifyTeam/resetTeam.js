import database from '#db';
import { deletePlayer } from '#services';
import { webhookMgr, withErrorHandling } from '#utils';

export const resetTeam = async (chat_id) =>
  withErrorHandling(
    async () => {
      const team = await database.teams.readBy({ chat_id });
      if (!team) return { text: 'resetTeam.notExists' };
      const players = await database.players.readAllByChatId(chat_id);
      const playersIDs = players.map(({ player_id }) => player_id);
      players.forEach((player) => {
        deletePlayer(player.nickname, chat_id);
      });
      webhookMgr.removePlayersFromList(playersIDs);

      return { text: 'resetTeam.success' };
    },
    {
      errorMessage: 'serverError',
    }
  )();
