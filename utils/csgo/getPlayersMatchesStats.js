import { Matches } from 'faceit-node-api';
import sleep from 'sleep';

export function getPlayersMatchesStats(player_id, matchesIDs) {
  const matches = new Matches();

  return Promise.all(
    matchesIDs.map((matchId) => {
      sleep.msleep(100);
      return matches.getStatisticsOfAMatch(matchId);
    })
  ).then((matchesStats) =>
    matchesStats.filter((data) =>
      [
        ...data?.rounds[0]?.teams[0].players,
        ...data?.rounds[0]?.teams[1].players,
      ].some((player) => player.player_id === player_id)
    )
  );
}
