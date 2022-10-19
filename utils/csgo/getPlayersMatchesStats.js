import { Matches } from 'faceit-node-api';

import { groupByFive } from '../index.js';

export async function getPlayersMatchesStats(player_id, matchesIDs) {
  const matches = new Matches();
  const matchesIDsGroups = groupByFive(matchesIDs);
  const matchesStats = [];

  for await (const matchesIDsGroup of matchesIDsGroups) {
    await Promise.all(
      matchesIDsGroup.map((matchID) =>
        matches.getStatisticsOfAMatch(matchID).then(async (matchStats) => {
          const { finished_at } = await matches.getMatchDetails(
            matchStats.rounds[0].match_id
          );
          matchStats.rounds = matchStats.rounds.map((round) => ({
            finished_at,
            ...round,
          }));

          return matchStats;
        })
      )
    ).then((matches) => matchesStats.push(...matches));
  }

  return matchesStats.filter((data) =>
    [
      ...data?.rounds[0]?.teams[0].players,
      ...data?.rounds[0]?.teams[1].players,
    ].some((player) => player.player_id === player_id)
  );
}
