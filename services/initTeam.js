import { Team } from '../models/index.js';

export const initTeam = async (chat_id) => {
  let team = await Team.findOne({ chat_id });

  if (!team) {
    team = new Team({ chat_id, players: [] });
    team.save();
  }
};
