import getPlayersStats from '../utils/csgo/getPlayersStats.mjs';
import { Player } from '../models/player.js';
import { Team } from '../models/team.js';
import { messages } from '../config/config.js';

export const addPlayer = async (name, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (checkPlayerUniqueness(team.players, name)) {
      return messages.addPlayer.exists(name);
    }

    const playerStats = await getPlayersStats([name]);
    const { player_id, nickname, elo, lvl } = playerStats[0];
    const player = new Player({ player_id, nickname, elo, lvl });
    const players = [...team.players, player];

    return Team.findOneAndUpdate({ chat_id }, { players }).then(() =>
      messages.addPlayer.success(name)
    );
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

function checkPlayerUniqueness(players, name) {
  return players.some(({ nickname }) => nickname === name);
}
