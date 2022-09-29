import getPlayersStats from '../utils/csgo/getPlayersStats.mjs';
import { Player } from '../models/player.js';
import { Team } from '../models/team.js';

export const addPlayer = async (name, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (checkPlayerUniqueness(team.players, name)) {
      return `Sorry, but ${name} already exists!`;
    }

    const playerStats = await getPlayersStats([name]);
    const { player_id, nickname, elo, lvl } = playerStats[0];
    const player = new Player({ player_id, nickname, elo, lvl });
    const players = [...team.players, player];

    return Team.findOneAndUpdate({ chat_id }, { players }).then(
      () => `Player ${name} was added!`
    );
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

function checkPlayerUniqueness(players, name) {
  return players.some(({ nickname }) => nickname === name);
}
