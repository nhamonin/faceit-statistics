import { Players } from 'faceit-node-api';

const players = new Players();

export default async function getPlayersStats(nicknames) {
  return await Promise.all(
    nicknames.map((nickname) =>
      players.getPlayerDetailsByNickname(nickname).then((player) => ({
        game: player.games.csgo,
        nickname: player.nickname,
        playerId: player.player_id,
        elo: player.games.csgo.faceit_elo,
        lvl: player.games.csgo.skill_level,
      }))
    )
  );
}
