import { Players } from 'faceit-node-api';

const players = new Players();

export default async function getPlayersStats(nicknames) {
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
          throw new Error('Player was not found!');
        })
    )
  );
}
