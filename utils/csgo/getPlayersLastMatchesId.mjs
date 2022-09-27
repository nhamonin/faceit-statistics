import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

const players = new Players();

export default async function getPlayersLastMatchesId(playerIDs) {
  return await Promise.all(
    playerIDs.map((playerID) => handlePlayerLastMatches(playerID))
  );
}

const getPlayerLastMatches = (playerID, MATCHES_LIMIT) =>
  players
    .getAllMatchesOfAPlayer(playerID, 'csgo', { limit: MATCHES_LIMIT })
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

const handlePlayerLastMatches = async (playerID) => {
  let result = [];
  let MATCHES_LIMIT = 20;

  while (result.length !== 20) {
    result = await getPlayerLastMatches(playerID, MATCHES_LIMIT);
    MATCHES_LIMIT += 20 - result.length;
  }

  return {
    [playerID]: result,
  };
};
