import { Players } from 'faceit-node-api';

import { getPlayerLastStats } from '../index.js';
import strings from '#strings';

export async function getPlayerInfo({
  playerNickname,
  playerID,
  playersNicknames,
}) {
  try {
    const players = new Players();
    const playerDetails = playerID
      ? await players.getPlayerDetailsByPlayerID(playerID)
      : await players.getPlayerDetailsByNickname(playerNickname);
    const { nickname, player_id, games } = playerDetails;
    const { kd, avg, winrate, hs } = await getPlayerLastStats(player_id);

    return {
      nickname,
      player_id,
      elo: games.csgo.faceit_elo,
      lvl: games.csgo.skill_level,
      kd,
      avg,
      winrate,
      hs,
    };
  } catch (e) {
    console.log(e);
    return {
      error: true,
      errorMessage: strings.addPlayer.notFound(
        playerNickname,
        playersNicknames
      ),
    };
  }
}
