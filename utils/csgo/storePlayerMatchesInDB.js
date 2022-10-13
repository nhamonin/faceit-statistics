import { Matches } from 'faceit-node-api';

import { getPlayersLastMatchesId, getPlayersMatchesStats } from '../index.js';
import { DEFAULT_MATCH_STORE_LIMIT } from '../../config/config.js';
import { Match } from '../../models/Match.js';

export async function storePlayerMatchesInDB(player) {
  const { player_id } = player;
  const playerLastMatchesId = await getPlayersLastMatchesId(
    player_id,
    DEFAULT_MATCH_STORE_LIMIT
  );
  const matchesStats = await getPlayersMatchesStats(
    player_id,
    playerLastMatchesId
  );

  const modelArr = [];
  matchesStats.map((matchesStats) =>
    matchesStats.rounds.map((round) => modelArr.push(new Match(round)))
  );

  Match.insertMany(modelArr);
  for (const match of modelArr) {
    player.matches.push(match);
  }

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
