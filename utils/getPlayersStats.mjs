import dotenv from 'dotenv';
import Faceit from 'faceit-js-api';

dotenv.config();
const faceit = new Faceit(process.env.FACEIT_API_KEY);

export default async function getPlayersStats(nicknames) {
  return await Promise.all(
    nicknames.map((nickname) =>
      faceit.getPlayerInfo(nickname).then((player) => ({
        game: player.games.csgo,
        nickname: player.nickname,
        playerId: player.id,
        elo: player.games.csgo.faceitElo,
        lvl: player.games.csgo.skillLevel,
      }))
    )
  );
}
