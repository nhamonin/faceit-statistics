import { Players } from 'faceit-node-api';

import { getPlayerLastStats, withErrorHandling } from '#utils';

export async function getPlayerInfo({ playerNickname, playerID, newPlayer }) {
  return withErrorHandling(
    async () => {
      const players = new Players();
      const playerDetails = playerID
        ? await players.getPlayerDetailsByPlayerID(playerID)
        : await players.getPlayerDetailsByNickname(playerNickname);
      if (!playerDetails.player_id) throw new Error('Player not found.');
      const { nickname, player_id, games } = playerDetails;
      const res = {
        nickname,
        player_id,
        elo: games?.csgo?.faceit_elo || 0,
        lvl: games?.csgo?.skill_level || 1,
      };

      if (newPlayer) return res;

      const { kd, avg, winrate, hs } = await getPlayerLastStats(player_id);

      return {
        ...res,
        kd,
        avg,
        winrate,
        hs,
      };
    },
    {
      error: true,
      errorMessage: 'addPlayer.notExists',
      errorOptions: {
        nickname: playerNickname,
      },
    }
  )();
}
