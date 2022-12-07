import { Player, Team } from '../models/index.js';
import { getPlayerInfo } from '../utils/index.js';
import { messages } from '../config/config.js';

export const updateTeamPlayers = async (chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return messages.teamNotExistError;
    const teamPlayerIDs = await team
      .populate('players')
      .then(({ players }) => players.map(({ player_id }) => player_id));
    const playersStats = await Promise.all(
      teamPlayerIDs.map((player_id) => getPlayerInfo({ playerID: player_id }))
    );

    for await (const {
      player_id,
      nickname,
      elo,
      lvl,
      last20KD,
      last50KD,
    } of playersStats) {
      Player.findOneAndUpdate(
        { player_id },
        { nickname, elo, lvl, last20KD, last50KD }
      ).then(() => {
        console.log(
          `Player ${nickname} was updated.`,
          new Date().toLocaleString()
        );
      });
    }

    return messages.updateTeamPlayers.success;
  } catch (e) {
    console.log(e.message);
    return messages.updateTeamPlayers.error;
  }
};
