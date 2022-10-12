import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

const players = new Players();

export function getPlayersLastMatchesId(playerIDs, limit) {
  return Promise.all(
    playerIDs.map((player_id) => handlePlayerLastMatches(player_id, limit))
  );
}

const handlePlayerLastMatches = async (player_id, limit) => {
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

  return {
    [player_id]: result.slice(0, limit),
  };
};

const getPlayerLastMatches = (player_id, limit, offset) =>
  players
    .getAllMatchesOfAPlayer(player_id, 'csgo', { limit, offset })
    .then((data) => {
      return data.items
        .filter(({ competition_name }) =>
          allowedCompetitionNames.includes(competition_name)
        )
        .map(({ match_id }) => match_id);
    })
    .catch((error) => {
      console.error('Error: ', error);
    });
