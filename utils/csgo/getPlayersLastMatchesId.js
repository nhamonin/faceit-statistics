import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

export async function getPlayersLastMatchesId(player_id, limit) {
  let maxCallsWithNoResults = 3;
  let result = [];
  let offset = 0;

  while (result.length < limit && maxCallsWithNoResults) {
    let playerLastMatches = await getPlayerLastMatches(
      player_id,
      limit,
      offset
    );
    result.push(...playerLastMatches);
    if (playerLastMatches.length === 0) maxCallsWithNoResults--;
    offset += limit;
  }

  return result.slice(0, limit);
}

const getPlayerLastMatches = (player_id, limit, offset) =>
  new Players()
    .getAllMatchesOfAPlayer(player_id, 'csgo', { limit, offset })
    .then(({ items }) =>
      items
        .filter(({ competition_name }) =>
          allowedCompetitionNames.includes(competition_name)
        )
        .map(({ match_id }) => match_id)
    )
    .catch((error) => {
      console.error('Error: ', error);
    });
