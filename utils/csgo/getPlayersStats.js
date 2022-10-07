import { Players } from 'faceit-node-api';

import { messages } from '../../config/config.js';

const players = new Players();

export async function getPlayersStats(nicknames) {
  return await Promise.all(
    nicknames.map((nickname) =>
      players
        .getPlayerDetailsByNickname(nickname)
        .then(({ nickname, player_id, games }) => ({
          nickname: nickname,
          player_id: player_id,
          elo: games.csgo.faceit_elo,
          lvl: games.csgo.skill_level,
        }))
        .catch((e) => {
          console.log(e.message);
          return {
            error: true,
            errorMessage: messages.addPlayer.notFound(nickname),
          };
        })
    )
  );
}
