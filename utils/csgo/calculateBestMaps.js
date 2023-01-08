import { Players } from 'faceit-node-api';

import { Team, Player } from '#models';
import {
  regulateWinrate,
  regulateAvg,
  prettifyMapPickerData,
  calculateAverage,
  calculateDifference,
  getTelegramBot,
  sendPhoto,
} from '#utils';
import {
  game_id,
  currentMapPool,
  allowedTeamsToGetMapPickerNotifications,
  caches,
} from '#config';
import { getBestMapsTemplate } from '#templates';

export async function calculateBestMaps(matchData) {
  if (caches.bestMapsMatchIDs.has(matchData.match_id)) return;
  caches.bestMapsMatchIDs.add(matchData.match_id);
  setTimeout(() => {
    caches.bestMapsMatchIDs.delete(matchData.match_id);
  }, 1000 * 10);

  try {
    const team1 = matchData.teams.faction1.roster;
    const team2 = matchData.teams.faction2.roster;
    const team1playersIDs = team1.map(({ player_id }) => player_id);
    const team2playersIDs = team2.map(({ player_id }) => player_id);
    const dbPlayersTeam1 = [];
    const dbPlayersTeam2 = [];
    const team1Stats = createStatsBoilerplate();
    const team2Stats = createStatsBoilerplate();
    const team1Result = [];
    const team2Result = [];
    const teamsObj = {
      0: [team1playersIDs, dbPlayersTeam1, team1Stats],
      1: [team2playersIDs, dbPlayersTeam2, team2Stats],
    };

    fillInStatsBoilerplateWithMaps([team1Stats, team2Stats]);
    await fillInTeamVariablesWithPlayersStats(teamsObj);
    calculateAverageAvg([team1Stats, team2Stats]);
    calculateAndFillAllData([team1Stats, team2Stats]);
    calculateDifferencesAndSortResult(
      team1Stats,
      team2Stats,
      team1Result,
      team2Result
    );
    await sendMapPickerResult(
      dbPlayersTeam1,
      dbPlayersTeam2,
      team1Result,
      team2Result
    );

    return [team1Result, team2Result];
  } catch (e) {
    console.log(e);
  }
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

async function fillInTeamVariablesWithPlayersStats(teamsObj) {
  const players = new Players();
  try {
    for await (const teamObjKey of Object.keys(teamsObj)) {
      const variablesArr = teamsObj[teamObjKey];

      await Promise.all(
        variablesArr[0].map(async (player_id) => {
          const player = await Player.findOne({ player_id });
          if (player)
            variablesArr[1].push({
              nickname: player.nickname,
              _id: player._id,
            });
          await players
            .getStatisticsOfAPlayer(player_id, game_id)
            .then((stats) => {
              if (!stats?.segments?.length) return;
              currentMapPool.map((map_id) => {
                variablesArr[2].lifetime[map_id].push(
                  stats.segments
                    .filter(
                      ({ mode, label }) => mode === '5v5' && label === map_id
                    )
                    .map(({ stats }) => ({
                      winrate: regulateWinrate(+stats['Win Rate %']),
                      avg: regulateAvg(+stats['Average Kills']),
                      matches: +stats['Matches'],
                    }))[0] || { winrate: 50, avg: 20, matches: 0 }
                );
              });
            });
        })
      );
    }
  } catch (e) {
    console.log(e);
  }
}

function calculateAverageAvg(arr) {
  try {
    arr.map((teamStats) => {
      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.avg[mapName] = calculateAverage(
          teamStats.lifetime[mapName].map(({ avg }) => avg)
        );
      });
    });
  } catch (e) {
    console.log(e);
  }
}

function calculateAndFillAllData(arr) {
  try {
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
  } catch (e) {
    console.log(e);
  }
}

function calculateDifferencesAndSortResult(
  team1Stats,
  team2Stats,
  team1Result,
  team2Result
) {
  try {
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

    team1Result.sort((a, b) => b?.totalWinrate - a?.totalWinrate);
    team2Result.sort((a, b) => b?.totalWinrate - a?.totalWinrate);
  } catch (e) {
    console.log(e);
  }
}

async function sendMapPickerResult(
  dbPlayersTeam1,
  dbPlayersTeam2,
  team1Result,
  team2Result
) {
  try {
    const neededVariables = dbPlayersTeam1.length
      ? [dbPlayersTeam1, team1Result]
      : [dbPlayersTeam2, team2Result];
    let teamsToSendNotification = new Set();

    for await (const player of neededVariables[0]) {
      const teams = await Team.find({
        players: player._id,
      });

      teams.map(({ chat_id }) => {
        teamsToSendNotification.add(chat_id);
      });
    }
    const tBot = getTelegramBot();

    [...new Set([...teamsToSendNotification])]
      .filter((chat_id) =>
        allowedTeamsToGetMapPickerNotifications.includes(chat_id)
      )
      .map((chat_id) => {
        const htmlMessage = prettifyMapPickerData(neededVariables);
        sendPhoto(
          tBot,
          chat_id,
          null,
          getBestMapsTemplate(htmlMessage, neededVariables[1][0].mapName)
        );
      });

    teamsToSendNotification = new Set();
  } catch (e) {
    console.log(e);
  }
}
