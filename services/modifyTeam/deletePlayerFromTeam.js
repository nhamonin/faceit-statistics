import database from '#db';
import {
  isPlayerTeamMember,
  webhookMgr,
  getTeamNicknames,
  withErrorHandling,
} from '#utils';

export const deletePlayer = async (playerNickname, chat_id) =>
  withErrorHandling(
    async () => {
      const team = await database.teams.readBy({ chat_id });
      if (!team) return { text: 'teamNotExistsError' };
      const players = await database.players.readAllByChatId(chat_id);

      if (!isPlayerTeamMember(players, playerNickname)) {
        return {
          text: 'deletePlayer.notExists',
          options: { nickname: playerNickname },
        };
      }

      const noPlayersInTeamAfterDeletion = players.length === 1;
      const playerInDB = await database.players.readBy({
        nickname: playerNickname,
      });

      return database.teamsPlayers
        .deleteAllBy({ chat_id, player_id: playerInDB.player_id })
        .then(async () => {
          const teamsWithPlayer = await database.teamsPlayers.readAllBy({
            player_id: playerInDB.player_id,
          });
          if (teamsWithPlayer.length) return;
          webhookMgr.removePlayersFromList([playerInDB.player_id]);
        })
        .then(async () => {
          const updatedPlayers = await database.players.readAllByChatId(
            chat_id
          );

          return noPlayersInTeamAfterDeletion
            ? { text: 'deletePlayer.lastWasDeleted' }
            : {
                text: 'deletePlayer.success',
                options: {
                  nickname: playerNickname,
                  teamNicknames: getTeamNicknames(updatedPlayers).join(', '),
                },
              };
        });
    },
    {
      errorMessage: 'serverError',
    }
  )();
