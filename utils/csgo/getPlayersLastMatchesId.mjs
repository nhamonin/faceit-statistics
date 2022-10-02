import { Players } from 'faceit-node-api';
import { allowedCompetitionNames } from '../../config/config.js';

const players = new Players();

export default async function getPlayersLastMatchesId(playerIDs, limit) {
  return await Promise.all(
    playerIDs.map((player_id) => handlePlayerLastMatches(player_id, limit))
  );
}

const handlePlayerLastMatches = async (player_id, matchesLimit) => {
  let result = [];
  let limit = matchesLimit;

  while (result.length !== matchesLimit) {
    result = await getPlayerLastMatches(player_id, limit);
    limit += matchesLimit - result?.length;
  }

  return {
    [player_id]: result,
  };
};

const getPlayerLastMatches = (player_id, limit) =>
  players
    .getAllMatchesOfAPlayer(player_id, 'csgo', { limit })
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
