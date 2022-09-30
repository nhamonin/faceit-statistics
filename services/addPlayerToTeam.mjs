import getPlayersStats from '../utils/csgo/getPlayersStats.mjs';
import { Player } from '../models/player.js';
import { Team } from '../models/team.js';
import { messages } from '../config/config.js';

export const addPlayer = async (name, chat_id) => {
  try {
    let { players } = await Team.findOne({ chat_id });

    if (isPlayerTeamMember(players, name)) {
      return messages.addPlayer.exists(name);
    }

    const playerStats = await getPlayersStats([name]);
    const { player_id, nickname, elo, lvl } = playerStats[0];
    const player = new Player({ player_id, nickname, elo, lvl });
    players = [...players, player];

    return Team.findOneAndUpdate({ chat_id }, { players }).then(() =>
      messages.addPlayer.success(name)
    );
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

function isPlayerTeamMember(players, name) {
  return players.some(({ nickname }) => nickname === name);
}
