import database from '#db';
import {
  regulateWinrate,
  regulateAvg,
  prettifyMapPickerData,
  calculateAverage,
  calculateDifference,
  telegramSendMessage,
  sendPhoto,
  getPlayerLifeTimeStats,
  cacheWithExpiry,
  withErrorHandling,
} from '#utils';
import { currentMapPool, caches } from '#config';
import { getBestMapsTemplate } from '#templates';
import { subscriptionReceivedMarkup } from '#telegramReplyMarkup';

export async function calculateBestMaps(matchData) {
  const addedToCache = cacheWithExpiry(
    caches.bestMapsMatchIDs,
    matchData?.payload?.id,
    1000 * 10
  );
  if (!addedToCache) return;

  return withErrorHandling(async () => {
    const { team1, team2 } = await processTeams(matchData);

    const team1Data = await getPlayersAndStats(team1.playersIDs);
    const team2Data = await getPlayersAndStats(team2.playersIDs);

    const team1Stats = team1Data.stats;
    const team2Stats = team2Data.stats;

    calculateAverageAvg([team1Stats, team2Stats]);
    calculateAndFillAllData([team1Stats, team2Stats]);

    const team1Result = [];
    const team2Result = [];

    calculateDifferencesAndSortResult(
      team1Stats,
      team2Stats,
      team1Result,
      team2Result
    );

    await sendMapPickerResult(
      team1Data.dbPlayers,
      team2Data.dbPlayers,
      team1Result,
      team2Result,
      team1.name,
      team2.name
    );

    return [team1Result, team2Result];
  })();
}

async function processTeams(matchData) {
  const faction1 = matchData?.payload?.teams?.faction1;
  const faction2 = matchData?.payload?.teams?.faction2;
  const team1 = faction1?.roster;
  const team2 = faction2?.roster;
  const team1Name = faction1?.name;
  const team2Name = faction2?.name;

  const team1playersIDs = team1.map(({ id }) => id);
  const team2playersIDs = team2.map(({ id }) => id);

  return {
    team1: { playersIDs: team1playersIDs, name: team1Name },
    team2: { playersIDs: team2playersIDs, name: team2Name },
  };
}

async function getPlayersAndStats(playersIDs) {
  const dbPlayers = [];
  const stats = createStatsBoilerplate();

  fillInStatsBoilerplateWithMaps([stats]);
  await fillInTeamVariablesWithPlayersStats(playersIDs, dbPlayers, stats);

  return { dbPlayers, stats };
}

function createStatsBoilerplate() {
  return {
    lifetime: {},
    avg: {},
    totalMatches: {},
    totalWinrate: {},
    winrateMatches: {},
  };
}

function fillInStatsBoilerplateWithMaps(arr) {
  arr.map(({ lifetime, avg, totalMatches, totalWinrate, winrateMatches }) => {
    currentMapPool.map((map_id) => {
      lifetime[map_id] = [];
      avg[map_id] = [];
      totalMatches[map_id] = [];
      totalWinrate[map_id] = [];
      winrateMatches[map_id] = [];
    });
  });
}

async function fillInTeamVariablesWithPlayersStats(
  playerIDs,
  dbPlayers,
  stats
) {
  await withErrorHandling(async () => {
    await Promise.all(
      playerIDs.map(async (player_id) => {
        const player = await database.players.readBy({ player_id });
        if (player)
          dbPlayers.push({
            nickname: player.nickname,
            player_id: player.player_id,
          });
        const lifeTimeStats = await getPlayerLifeTimeStats(player_id);
        const segments =
          lifeTimeStats?.segments &&
          lifeTimeStats.segments[
            +!Object.keys(lifeTimeStats.segments[0]?.segments)[0].startsWith(
              'de_'
            )
          ]?.segments;
        if (!segments || !Object.keys(segments).length) return;
        currentMapPool.map((map_id) => {
          stats.lifetime[map_id].push(
            segments[map_id]
              ? {
                  winrate: regulateWinrate(+segments[map_id].k6),
                  avg: regulateAvg(+segments[map_id].k1),
                  matches: +segments[map_id].m1,
                }
              : { winrate: 50, avg: 18, matches: 0 }
          );
        });
      })
    );
  })();
}

function calculateAverageAvg(arr) {
  withErrorHandling(() => {
    arr.map((teamStats) => {
      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.avg[mapName] = calculateAverage(
          teamStats.lifetime[mapName].map(({ avg }) => avg)
        );
      });
    });
  })();
}

function calculateAndFillAllData(arr) {
  withErrorHandling(() => {
    arr.map((teamStats) => {
      const lifetime = teamStats.lifetime;

      Object.keys(lifetime).map((mapName) => {
        teamStats.winrateMatches[mapName] = lifetime[mapName].reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue?.winrate * currentValue?.matches,
          0
        );
        teamStats.totalMatches[mapName] =
          lifetime[mapName].reduce(
            (accumulator, currentValue) => accumulator + currentValue?.matches,
            0
          ) || 0;
        teamStats.totalWinrate[mapName] =
          +(
            teamStats.winrateMatches[mapName] / teamStats.totalMatches[mapName]
          ).toFixed(2) || 0;

        lifetime[mapName].map((soloStats) => {
          const soloAvg = soloStats.avg;
          const teamAvg = teamStats.avg[mapName];
          soloStats.cf = (1 + (soloAvg - teamAvg) / teamAvg) * 0.2;
          soloStats.points = +(soloStats.cf * soloStats.winrate * 10).toFixed(
            2
          );
        });
      });

      Object.keys(lifetime).map((mapName) => {
        lifetime[mapName] = {
          totalWinrate:
            +(
              teamStats.winrateMatches[mapName] /
              teamStats.totalMatches[mapName]
            ).toFixed(2) || 0,
          totalMatches: teamStats.totalMatches[mapName],
          totalPoints: +lifetime[mapName]
            .map(({ points }) => points)
            .reduce((a, b) => a + b, 0)
            .toFixed(2),
        };
      });
    });
  })();
}

function calculateDifferencesAndSortResult(
  team1Stats,
  team2Stats,
  team1Result,
  team2Result
) {
  withErrorHandling(() => {
    currentMapPool.map((mapName) => {
      team1Result.push({
        mapName,
        totalPoints: calculateDifference(
          team1Stats.lifetime[mapName].totalPoints,
          team2Stats.lifetime[mapName].totalPoints
        ),
        totalWinrate: calculateDifference(
          team1Stats.lifetime[mapName].totalWinrate,
          team2Stats.lifetime[mapName].totalWinrate
        ),
        totalMatches: calculateDifference(
          team1Stats.lifetime[mapName].totalMatches,
          team2Stats.lifetime[mapName].totalMatches
        ),
      });

      team2Result.push({
        mapName,
        totalPoints: calculateDifference(
          team2Stats.lifetime[mapName].totalPoints,
          team1Stats.lifetime[mapName].totalPoints
        ),
        totalWinrate: calculateDifference(
          team2Stats.lifetime[mapName].totalWinrate,
          team1Stats.lifetime[mapName].totalWinrate
        ),
        totalMatches: calculateDifference(
          team2Stats.lifetime[mapName].totalMatches,
          team1Stats.lifetime[mapName].totalMatches
        ),
      });
    });

    team1Result.sort((a, b) => b?.totalPoints - a?.totalPoints);
    team2Result.sort((a, b) => b?.totalPoints - a?.totalPoints);
  })();
}

async function sendMapPickerResult(
  dbPlayersTeam1,
  dbPlayersTeam2,
  team1Result,
  team2Result,
  team1Name,
  team2Name
) {
  const playersInDB = dbPlayersTeam1.length || dbPlayersTeam2.length;
  // if (!playersInDB) return;

  withErrorHandling(async () => {
    const neededVariables = dbPlayersTeam1.length
      ? [dbPlayersTeam1, team1Result, team1Name]
      : [dbPlayersTeam2, team2Result, team2Name];
    let teamsToSendNotification = new Map();
    const opponentTeamName =
      neededVariables[2] === team1Name ? team2Name : team1Name;

    for await (const player of neededVariables[0]) {
      const teams = (
        await database.teams.readAllByPlayerId(player.player_id)
      ).filter(
        (team) =>
          team.settings.subscriptions.match_object_created.calculateBestMaps
      );

      teams.map(({ chat_id }) => {
        if (teamsToSendNotification.has(chat_id)) {
          teamsToSendNotification.get(chat_id).push(player.nickname);
        } else {
          teamsToSendNotification.set(chat_id, [player.nickname]);
        }
      });
    }

    teamsToSendNotification.set(
      -886965844,
      neededVariables[0].map(({ nickname }) => nickname)
    );

    const htmlMessage = prettifyMapPickerData(neededVariables);
    await sendPhoto(
      [...teamsToSendNotification.keys()],
      null,
      getBestMapsTemplate(htmlMessage, neededVariables[1][0].mapName),
      false
    );

    if (!playersInDB) return;
    [...teamsToSendNotification].forEach((team) => {
      const chat_id = team[0];
      const teammates = team[1];
      const teammatesString = teammates
        .map((nickname) => `<b>${nickname}</b>`)
        .join(', ');

      telegramSendMessage(
        chat_id,
        {
          text: 'subscriptions.calculateBestMaps.message',
          options: {
            yourTeamName: neededVariables[2],
            opponentTeamName,
            teamNicknames: teammatesString,
          },
        },
        {
          parse_mode: 'html',
          ...subscriptionReceivedMarkup(
            'match_object_created',
            'calculateBestMaps'
          ),
        }
      );
    });
  })();
}
