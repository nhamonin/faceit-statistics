import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

const players = new Players();

export default async function getPlayersLastMatchesId(playerIDs, limit) {
  return await Promise.all(
    playerIDs.map((playerID) => handlePlayerLastMatches(playerID, limit))
  );
}

const handlePlayerLastMatches = async (playerID, matchesLimit) => {
  let result = [];
  let limit = matchesLimit;

  while (result.length !== matchesLimit) {
    result = await getPlayerLastMatches(playerID, limit);
    limit += matchesLimit - result.length;
  }

  return {
    [playerID]: result,
  };
};

const getPlayerLastMatches = (playerID, limit) =>
  players
    .getAllMatchesOfAPlayer(playerID, 'csgo', { limit })
    .then(({ items }) => {
      const filtered = items.filter(
        (item) => item.playing_players.length === 10
      );
      return items
        .filter(({ competition_name }) =>
          allowedCompetitionNames.includes(competition_name)
        )
        .map(({ match_id }) => match_id);
    })
    .catch((error) => {
      console.error('Error: ', error);
    });
