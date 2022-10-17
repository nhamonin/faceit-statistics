import { Matches } from 'faceit-node-api';

import { groupByFive } from '../index.js';

export async function getPlayersMatchesStats(player_id, matchesIDs) {
  const matches = new Matches();
  const matchesIDsGroups = groupByFive(matchesIDs);
  const matchesStats = [];

  for (const matchesIDsGroup of matchesIDsGroups) {
    await Promise.all(
      matchesIDsGroup.map((matchID) =>
        matches
          .getStatisticsOfAMatch(matchID)
          .then((match) => matchesStats.push(match))
      )
    );
  }

  return matchesStats.filter((data) =>
    [
      ...data?.rounds[0]?.teams[0].players,
      ...data?.rounds[0]?.teams[1].players,
    ].some((player) => player.player_id === player_id)
  );
}
