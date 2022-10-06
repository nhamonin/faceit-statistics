import { Team } from '../models/team.js';

export const initTeam = async (chat_id) => {
  let team = await Team.findOne({ chat_id });

  if (!team) {
    team = new Team({ chat_id, players: [] });
    team.save();
  }
};
