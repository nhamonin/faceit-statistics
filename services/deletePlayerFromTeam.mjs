import { Team } from '../models/team.js';
import { messages } from '../config/config.js';
import { isPlayerTeamMember } from '../utils/basic.mjs';

export const deletePlayer = async (name, chat_id) => {
  try {
    let { players } = await Team.findOne({ chat_id });

    if (!isPlayerTeamMember(players, name)) {
      return messages.deletePlayer.notExists(name);
    }

    players = players.filter(({ nickname }) => nickname !== name);

    return Team.findOneAndUpdate({ chat_id }, { players }).then(() =>
      messages.deletePlayer.success(name)
    );
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};
