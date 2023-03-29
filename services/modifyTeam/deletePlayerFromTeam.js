import {
  db,
  isPlayerTeamMember,
  webhookMgr,
  getTeamNicknames,
  getPlayersByChatId,
} from '#utils';

export const deletePlayer = async (playerNickname, chat_id) => {
  try {
    const team = await db('team').where({ chat_id }).first();
    if (!team) return { text: 'teamNotExistsError' };
    const players = await getPlayersByChatId(chat_id);

    if (!isPlayerTeamMember(players, playerNickname)) {
      return {
        text: 'deletePlayer.notExists',
        options: { nickname: playerNickname },
      };
    }

    const noPlayersInTeamAfterDeletion = players.length === 1;
    const playerInDB = await db('player')
      .where({ nickname: playerNickname })
      .first();

    return await db('team_player')
      .where({ chat_id, player_id: playerInDB.player_id })
      .del()
      .then(async () => {
        const teamsWithPlayer = await db('team_player').where({
          player_id: playerInDB.player_id,
        });
        if (teamsWithPlayer.length) return;
        webhookMgr.removePlayersFromList([playerInDB.player_id]);
      })
      .then(async () => {
        const players = await getPlayersByChatId(chat_id);

        return noPlayersInTeamAfterDeletion
          ? { text: 'deletePlayer.lastWasDeleted' }
          : {
              text: 'deletePlayer.success',
              options: {
                nickname: playerNickname,
                teamNicknames: getTeamNicknames(players).join(', '),
              },
            };
      });
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
