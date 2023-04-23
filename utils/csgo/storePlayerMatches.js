import { Players } from 'faceit-node-api';

import database from '#db';
import {
  getHighAmountOfPlayerLastMatches,
  prettifyScoreBasedOnResult,
} from '#utils';
import { game_id } from '#config';

const players = new Players();

export async function storePlayerMatches(player_id, chat_id, limit) {
  const playerStatistics = await players.getStatisticsOfAPlayer(
    player_id,
    game_id
  );
  const matchesAmount = limit || +playerStatistics?.lifetime?.Matches || 0;
  const matches = await getHighAmountOfPlayerLastMatches(
    player_id,
    matchesAmount,
    chat_id
  );

  const matchesToStore = matches
    .filter(({ game }) => game === game_id)
    .map(mapMatchProperties);

  await database.matches.createMany(matchesToStore);
}

function mapMatchProperties({
  matchId,
  playerId,
  gameMode,
  elo,
  i1,
  c2,
  i6,
  i10,
  i18,
  c4,
  date,
}) {
  return {
    match_id: matchId,
    player_id: playerId,
    game_mode: gameMode,
    map: i1,
    elo: elo ? +elo : null,
    score: prettifyScoreBasedOnResult(i18, +i10),
    kd: +c2,
    kills: +i6,
    win: +i10,
    hs: +c4,
    timestamp: new Date(date),
  };
}
