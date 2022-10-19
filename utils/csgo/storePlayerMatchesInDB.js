import {
  getPlayersLastMatchesId,
  getPlayersMatchesStats,
  clearPeriodically,
} from '../index.js';
import {
  DEFAULT_MATCH_STORE_LIMIT,
  CLEAR_CACHE_MINUTES,
} from '../../config/config.js';
import { Match } from '../../models/index.js';

const cache = new Set();
clearPeriodically(cache, new Set(), CLEAR_CACHE_MINUTES);

export async function storePlayerMatchesInDB(player) {
  const { player_id } = player;
  const playerLastMatchesId = await getPlayersLastMatchesId(
    player_id,
    DEFAULT_MATCH_STORE_LIMIT
  );
  const matchesInDB = await Match.find()
    .where('match_id')
    .in(playerLastMatchesId)
    .exec();
  const matchesIDToSave = playerLastMatchesId.filter(
    (lastMatchID) =>
      !cache.has(lastMatchID) &&
      !matchesInDB.some(({ match_id }) => match_id === lastMatchID)
  );
  for (const lastMatchID of playerLastMatchesId) {
    cache.add(lastMatchID);
  }
  const matchesStats = await getPlayersMatchesStats(player_id, matchesIDToSave);
  const modelArr = [];
  matchesStats.map((matchesStats) =>
    matchesStats.rounds.map((round) =>
      modelArr.push(new Match({ _id: round.match_id, ...round }))
    )
  );

  await Match.insertMany(modelArr);
  player.matches = playerLastMatchesId;

  try {
    player.save().then(() => {
      console.log(
        `Player ${player.nickname} was added to the team from the Faceit API.`
      );
    });
  } catch (e) {
    console.log(e);
  }
}
