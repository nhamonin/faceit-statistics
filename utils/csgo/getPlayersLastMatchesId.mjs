import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

const players = new Players();

export default async function getPlayersLastMatchesId(playerIDs, limit) {
  return await Promise.all(
    playerIDs.map((player_id) => handlePlayerLastMatches(player_id, limit))
  );
}

const handlePlayerLastMatches = async (player_id, matchesLimit) => {
  let maxCallsWithNoResults = 3;
  let result = [];
  let offset = 0;

  while (result.length < matchesLimit && maxCallsWithNoResults) {
    let playerLastMatches = await getPlayerLastMatches(
      player_id,
      matchesLimit,
      offset
    );
    result.push(...playerLastMatches);
    if (playerLastMatches.length === 0) maxCallsWithNoResults--;
    console.log(result.length);
    offset += matchesLimit;
  }

  return {
    [player_id]: result.slice(0, matchesLimit),
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
