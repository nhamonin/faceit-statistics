import database from '#db';
import {
  getPlayerInfo,
  cacheWithExpiry,
  withErrorHandling,
  storePlayerMatches,
} from '#utils';
import { getHighestElo } from '#services';
import { caches } from '#config';

export const updatePlayers = async ({
  playerIDs,
  isHardUpdate = false,
  withAPIMatches = false,
}) =>
  withErrorHandling(
    async () => {
      const filteredPlayerIDs = [];

      for (const player_id of playerIDs) {
        const addedToCache = cacheWithExpiry(
          caches.updatedPlayers,
          player_id,
          1000 * 60 * 5
        );
        if (!addedToCache) continue;

        filteredPlayerIDs.push(player_id);
      }

      const existingPlayerIDs = await filterExistingPlayers(filteredPlayerIDs);

      if (withAPIMatches) {
        await updatePlayerMatches(existingPlayerIDs, isHardUpdate);
      }
      await updatePlayerStats(existingPlayerIDs);

      return { text: 'updatePlayers.success' };
    },
    {
      errorMessage: 'updatePlayers.error',
    }
  )();

async function filterExistingPlayers(teamPlayerIDs) {
  const playersInDatabase = await Promise.all(
    teamPlayerIDs.map(async (player_id) => {
      const player = await database.players.readBy({ player_id });
      return !!player;
    })
  );
  return teamPlayerIDs.filter((_, index) => playersInDatabase[index]);
}

async function updatePlayerMatches(playerIDs, isHardUpdate) {
  for await (const player_id of playerIDs) {
    if (isHardUpdate) await database.matches.deleteAllBy({ player_id });
    await storePlayerMatches(player_id, null, isHardUpdate ? null : 100);
  }
}

async function updatePlayerStats(playerIDs) {
  const playerStatsArray = await Promise.all(
    playerIDs.map((playerID) => getPlayerInfo({ playerID }))
  );

  for (const playerStats of playerStatsArray) {
    const { player_id, nickname, elo, lvl, kd, avg, hs, winrate } = playerStats;
    if (!player_id) continue;

    await database.players.updateAllBy(
      { player_id },
      {
        nickname,
        elo,
        lvl,
        kd: JSON.stringify(kd),
        avg: JSON.stringify(avg),
        hs: JSON.stringify(hs),
        winrate: JSON.stringify(winrate),
      }
    );

    const updatedPlayer = await database.players.readBy({ player_id });
    const { elo: updatedElo, highestElo, highestEloDate } = updatedPlayer;

    await getHighestElo(nickname);

    if (highestElo && highestEloDate && updatedElo >= highestElo) {
      await database.players.updateAllBy(
        { player_id },
        { highestElo: updatedElo, highestEloDate: new Date() }
      );
    }
  }
}
