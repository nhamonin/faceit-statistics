import { Player, Team } from '../models/index.js';
import { getPlayersStats } from '../utils/index.js';
import { messages } from '../config/config.js';

export const updateTeamPlayers = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    const teamNicknames = await team
      .populate('players')
      .then(({ players }) => players.map(({ nickname }) => nickname));

    const playersStats = await getPlayersStats(teamNicknames);

    playersStats.map(({ nickname, elo, lvl }) => {
      Player.findOneAndUpdate({ nickname }, { elo, lvl });
    });

    return messages.updateTeamPlayers.success;
  } catch (e) {
    console.log(e.message);
    return messages.updateTeamPlayers.error;
  }
};
