import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

import { allowedCompetitionNames } from '../config/config.js';

export default async function getPlayersLastMatchesId(playerIDs) {
  return await Promise.all(
    playerIDs.map((playerID) => handlePlayerLastMatches(playerID))
  );
}

const getPlayerLastMatches = async (playerID, MATCHES_LIMIT) =>
  await fetch(
    `https://open.faceit.com/data/v4/players/${playerID}/history?game=csgo&limit=${MATCHES_LIMIT}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then((response) => response.json())
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
