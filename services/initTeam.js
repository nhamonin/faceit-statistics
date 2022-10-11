import { Team } from '../models/index.js';
import { messages } from '../config/config.js';

export const initTeam = async (chat_id) => {
  try {
    let team = await Team.findOne({ chat_id });

    if (!team) {
      team = new Team({ chat_id, players: [] });
      team.save();
    }
  } catch (e) {
    console.log(e.message);
    return messages.serverError;
  }
};
