import { Team } from '#models';
import { deletePlayer } from '#services';
import { webhookMgr } from '#utils';
import strings from '#strings';

export const resetTeam = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return { error: strings.resetTeam.notExists };
    const { players } = await team.populate('players');
    const playersIDs = players.map(({ player_id }) => player_id);

    players.forEach((player) => {
      deletePlayer(player.nickname, chat_id);
    });
    webhookMgr.removePlayersFromList(playersIDs);

    return { message: strings.resetTeam.success };
  } catch (e) {
    console.log(e);
    return { error: strings.serverError };
  }
};
