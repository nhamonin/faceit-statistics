import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export default async function getPlayersMatchesStats(playersMatchesId) {
  return await Promise.all(
    playersMatchesId.map(async (playerMatchesId) => {
      const playerId = Object.keys(playerMatchesId)[0];
      const matchesId = playerMatchesId[playerId];

      return await Promise.all(
        matchesId.map((matchId) =>
          fetch(`https://open.faceit.com/data/v4/matches/${matchId}/stats`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then((data) => {
              const players = [
                ...data.rounds[0].teams[0].players,
                ...data.rounds[0].teams[1].players,
              ];
              return players.filter(
                (player) => player.player_id === playerId
              )[0];
            })
            .catch((error) => {
              console.error('Error: ', error);
            })
        )
      );
    })
  );
}
