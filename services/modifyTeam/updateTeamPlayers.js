import { db, getPlayersByChatId, getPlayerInfo } from '#utils';
import { getHighestElo } from '#services';
import { caches } from '#config';

export const updateTeamPlayers = async (chat_id) => {
  if (caches.updateTeamPlayers.has(chat_id)) return;
  caches.updateTeamPlayers.add(chat_id);
  setTimeout(() => {
    caches.updateTeamPlayers.delete(chat_id);
  }, 1000 * 60);
  try {
    const team = await db('team').where({ chat_id }).first();
    if (!team) return { text: 'teamNotExistError' };
    const teamPlayerIDs = (await getPlayersByChatId(chat_id)).map(
      ({ player_id }) => player_id
    );
    const playersStats = await Promise.all(
      teamPlayerIDs.map((player_id) => getPlayerInfo({ playerID: player_id }))
    );

    for await (const {
      player_id,
      nickname,
      elo,
      lvl,
      kd,
      avg,
      hs,
      winrate,
    } of playersStats) {
      db('player')
        .where({ player_id })
        .update({ nickname, elo, lvl, kd, avg, hs, winrate })
        .then(async () => {
          const {
            elo: updatedElo,
            highestElo,
            highestEloDate,
          } = await db('player').where({ player_id }).first();

          await getHighestElo(nickname);

          if (highestElo && highestEloDate && updatedElo >= highestElo) {
            await db('player')
              .where({ player_id })
              .update({ highestElo: updatedElo, highestEloDate: new Date() });
          }
        });
    }

    return { text: 'updateTeamPlayers.success' };
  } catch (e) {
    console.log(e);
    return { text: 'updateTeamPlayers.error' };
  }
};
