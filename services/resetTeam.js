import { Team } from '#models';
import { messages } from '#config';
import { deletePlayer } from '#services';
import { webhookMgr } from '#utils';

export const resetTeam = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });

    if (!team) return { error: messages.resetTeam.notExists };

    const { players } = await team.populate('players');
    const playersIDs = players.map(({ player_id }) => player_id);

    players.forEach((player) => {
      deletePlayer(player.nickname, chat_id);
    });
    webhookMgr.removePlayersFromList(playersIDs);

    return { message: messages.resetTeam.success };
  } catch (e) {
    console.log(e.message);
    return { error: messages.serverError };
  }
};
