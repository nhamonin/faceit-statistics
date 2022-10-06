import { Matches } from 'faceit-node-api';

const matches = new Matches();

export default async function getPlayersMatchesStats(playersMatchesId) {
  return await Promise.all(
    playersMatchesId.map(async (playerMatchesId) => {
      const player_id = Object.keys(playerMatchesId)[0];
      const matchesId = playerMatchesId[player_id];

      return await Promise.all(
        matchesId.map((matchId) =>
          matches
            .getStatisticsOfAMatch(matchId)
            .then((data) => {
              const players = [
                ...data?.rounds[0]?.teams[0].players,
                ...data?.rounds[0]?.teams[1].players,
              ];
              return players.filter(
                (player) => player.player_id === player_id
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
