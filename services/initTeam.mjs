import { Team } from '../models/team.js';

export const initTeam = (chat_id) => {
  const team = new Team({ chat_id, players: [] });
  team.save();
};
