import { Team } from '../models/index.js';
import { messages } from '../config/config.js';
import { deletePlayer } from '../services/index.js';

export const resetTeam = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });

    if (!team) {
      return { error: messages.resetTeam.notExists };
    }

    const { players } = await team.populate('players');

    players.forEach((player) => {
      deletePlayer(player.nickname, chat_id);
    });

    return { message: messages.resetTeam.success };
  } catch (e) {
    console.log(e.message);
    return { error: messages.serverError };
  }
};
