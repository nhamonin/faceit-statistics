import { Players } from 'faceit-node-api';

import database from '#db';
import { getHighAmountOfPlayerLastMatches } from '#utils';
import { game_id } from '#config';

const players = new Players();
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 60 * 1000;

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
  await updateMissingElo(player_id, matchesToStore);
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
    score: i18,
    kd: +c2,
    kills: +i6,
    win: +i10,
    hs: +c4,
    timestamp: new Date(date),
  };
}

async function updateMissingElo(player_id, matches, retryCount = 0) {
  if (retryCount >= MAX_RETRY_COUNT) {
    return;
  }

  const missingEloMatches = matches.filter((match) => !match.elo);

  if (missingEloMatches.length > 0) {
    const newMatches = await getHighAmountOfPlayerLastMatches(player_id, 100);

    setTimeout(async () => {
      for (const match of missingEloMatches) {
        const updatedMatch = newMatches.find(
          (newMatch) => newMatch.matchId === match.match_id
        );
        const updatedElo = updatedMatch.elo ? +updatedMatch.elo : null;

        if (updatedElo) {
          await database.matches.updateAllBy(
            { match_id: match.match_id },
            { elo: updatedElo }
          );
        } else {
          setTimeout(
            () => updateMissingElo(player_id, [match], retryCount + 1),
            RETRY_DELAY
          );
        }
      }
    }, RETRY_DELAY);
  }
}
