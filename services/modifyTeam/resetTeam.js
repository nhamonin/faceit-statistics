import { deletePlayer } from '#services';
import { db, getPlayersByChatId, webhookMgr } from '#utils';

export const resetTeam = async (chat_id) => {
  try {
    const team = await db('team').where({ chat_id }).first();
    if (!team) return { text: 'resetTeam.notExists' };
    const players = await getPlayersByChatId(chat_id);
    const playersIDs = players.map(({ player_id }) => player_id);

    players.forEach((player) => {
      deletePlayer(player.nickname, chat_id);
    });
    webhookMgr.removePlayersFromList(playersIDs);

    return { text: 'resetTeam.success' };
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
