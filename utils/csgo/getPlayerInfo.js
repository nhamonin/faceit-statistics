import { Players } from 'faceit-node-api';

import strings from '#strings';
import { getPlayerAvgKD } from '../index.js';

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
    const { last20KD, last50KD } = await getPlayerAvgKD(player_id, [20, 50]);

    return {
      nickname,
      player_id,
      elo: games.csgo.faceit_elo,
      lvl: games.csgo.skill_level,
      last20KD,
      last50KD,
    };
  } catch (e) {
    console.log(e.message);
    return {
      error: true,
      errorMessage: strings.addPlayer.notFound(
        playerNickname,
        playersNicknames
      ),
    };
  }
}
