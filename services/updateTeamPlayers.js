import { Player, Team } from '../models/index.js';
import { getPlayerInfo } from '../utils/index.js';
import { messages } from '../config/config.js';

export const updateTeamPlayers = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return messages.teamNotExistError;
    const teamNicknames = await team
      .populate('players')
      .then(({ players }) => players.map(({ nickname }) => nickname));
    const playersStats = await Promise.all(
      teamNicknames.map((nickname) => getPlayerInfo(nickname))
    );

    for await (const {
      nickname,
      elo,
      lvl,
      last20KD,
      last50KD,
    } of playersStats) {
      Player.findOneAndUpdate(
        { nickname },
        { elo, lvl, last20KD, last50KD }
      ).then(() => {});
    }

    return messages.updateTeamPlayers.success;
  } catch (e) {
    console.log(e.message);
    return messages.updateTeamPlayers.error;
  }
};
