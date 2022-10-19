import { Team } from '../models/index.js';
import { messages } from '../config/config.js';

export const initTeam = async ({ id, first_name, username, title, type }) => {
  try {
    let team = await Team.findOne({ chat_id: id });

    if (!team) {
      team = new Team({
        chat_id: id,
        type,
        username,
        first_name,
        title,
        players: [],
      });
      team.save();
    }
  } catch (e) {
    console.log(e.message);
    return messages.serverError;
  }
};
