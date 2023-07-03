import Bottleneck from 'bottleneck';

import database from '#db';
import {
  getPlayerInfo,
  cacheWithExpiry,
  withErrorHandling,
  storePlayerMatches,
} from '#utils';
import { getHighestElo } from '#services';
import { caches } from '#config';

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200,
});

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
  const playersInDatabase = await database.players.readAllWhereIn(
    'player_id',
    teamPlayerIDs
  );
  const playerIdsInDatabase = new Set(
    playersInDatabase.map((player) => player.player_id)
  );
  const existingPlayerIDs = teamPlayerIDs.filter((player_id) =>
    playerIdsInDatabase.has(player_id)
  );

  return existingPlayerIDs;
}

async function updatePlayerMatches(playerIDs, isHardUpdate) {
  for await (const player_id of playerIDs) {
    if (isHardUpdate) await database.matches.deleteAllBy({ player_id });
    await storePlayerMatches(player_id, null, isHardUpdate ? null : 100);
  }
}

async function updatePlayerStats(playerIDs) {
  const playerStatsArray = await Promise.all(
    playerIDs.map((playerID) =>
      limiter.schedule(() => getPlayerInfo({ playerID }))
    )
  );
  const recordsToUpdate = playerStatsArray
    .map((playerStats) => {
      const { player_id, nickname, elo, lvl, kd, avg, hs, winrate } =
        playerStats;
      if (!player_id) return null;

      return {
        player_id,
        nickname,
        elo,
        lvl,
        kd: JSON.stringify(kd),
        avg: JSON.stringify(avg),
        hs: JSON.stringify(hs),
        winrate: JSON.stringify(winrate),
      };
    })
    .filter(Boolean);

  await database.players.batchUpdate('player_id', recordsToUpdate);

  const highestEloUpdates = [];

  for await (const record of recordsToUpdate) {
    const { player_id, nickname } = record;
    const updatedPlayer = await database.players.readBy({ player_id });
    const { elo: updatedElo, highestElo, highestEloDate } = updatedPlayer;

    await getHighestElo(nickname);

    if (highestElo && highestEloDate && updatedElo >= highestElo) {
      highestEloUpdates.push({
        player_id,
        highestElo: updatedElo,
        highestEloDate: new Date(),
        nickname,
      });
    }
  }

  await database.players.batchUpdate('player_id', highestEloUpdates);
}
