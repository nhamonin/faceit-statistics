import { Team, Player } from '#models';
import {
  prettifyMapPickerData,
  calculateAverage,
  calculateDifference,
  getTelegramBot,
  sendPhoto,
  getPlayerMatches,
} from '#utils';
import { currentMapPool, caches } from '#config';
import { getBestMapsTemplate } from '#templates';
import { mainMenuMarkup } from '#telegramReplyMarkup';

export async function calculateBestMapsLast50(matchData) {
  if (caches.bestMapsMatchIDsLast50.has(matchData?.payload?.id)) return;
  caches.bestMapsMatchIDsLast50.add(matchData?.payload?.id);
  setTimeout(() => {
    caches.bestMapsMatchIDsLast50.delete(matchData?.payload?.id);
  }, 1000 * 10);

  try {
    const faction1 = matchData?.payload?.teams?.faction1;
    const faction2 = matchData?.payload?.teams?.faction2;
    const team1 = faction1?.roster;
    const team2 = faction2?.roster;
    const team1Name = faction1?.name;
    const team2Name = faction2?.name;
    const team1playersIDs = team1.map(({ id }) => id);
    const team2playersIDs = team2.map(({ id }) => id);
    const dbPlayersTeam1 = [];
    const dbPlayersTeam2 = [];
    const { team1Matches, team2Matches } = await getTeamsMatches([
      team1playersIDs,
      team2playersIDs,
    ]);
    const team1Stats = createMapsBoilerplate();
    const team2Stats = createMapsBoilerplate();
    const team1Result = [];
    const team2Result = [];
    const teamsObj = {
      0: [team1playersIDs, dbPlayersTeam1, team1Stats],
      1: [team2playersIDs, dbPlayersTeam2, team2Stats],
    };

    fillInStatsBoilerplateWithMaps(
      [team1Stats, team2Stats],
      [team1Matches, team2Matches]
    );
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
      team2Result,
      team1Name,
      team2Name
    );

    return [team1Result, team2Result];
  } catch (e) {
    console.log(e);
  }
}

async function getTeamsMatches(teamIDsArr) {
  const resultArr = await Promise.all(
    teamIDsArr.map((teamIDs) =>
      Promise.all(teamIDs.map((playerID) => getPlayerMatches(playerID, 50)))
    )
  );

  return {
    team1Matches: resultArr[0],
    team2Matches: resultArr[1],
  };
}

function createMapsBoilerplate() {
  let res = {
    last50: {},
    avg: {},
    totalMatches: {},
    totalWinrate: {},
    winrateMatches: {},
  };

  currentMapPool.map((map_id) => {
    res.last50[map_id] = [];
    res.avg[map_id] = [];
    res.totalMatches[map_id] = [];
    res.totalWinrate[map_id] = [];
    res.winrateMatches[map_id] = [];
  });

  return res;
}

function fillInStatsBoilerplateWithMaps(arrStats, arrMaps) {
  arrStats.map((teamStats, index) => {
    Object.keys(teamStats.last50).map((map_id) => {
      teamStats.last50[map_id] = arrMaps[index].map((maps) =>
        maps.filter(({ i1 }) => i1 === map_id)
      );

      teamStats.last50[map_id] = teamStats.last50[map_id].map((maps) => ({
        matches: maps.length,
        avg: calculateAverage(maps.map(({ i6 }) => +i6)) || 18,
        winrate: calculateAverage(maps.map(({ i10 }) => +i10 * 100)) || 50,
      }));
    });
  });
}

async function fillInTeamVariablesWithPlayersStats(teamsObj) {
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
      currentMapPool.map((mapName) => {
        teamStats.avg[mapName] = calculateAverage(
          teamStats.last50[mapName].map(({ avg }) => avg)
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
      const last50 = teamStats.last50;

      currentMapPool.map((mapName) => {
        teamStats.winrateMatches[mapName] = last50[mapName].reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue?.winrate * currentValue?.matches,
          0
        );
        teamStats.totalMatches[mapName] =
          last50[mapName].reduce(
            (accumulator, currentValue) => accumulator + currentValue?.matches,
            0
          ) || 0;
        teamStats.totalWinrate[mapName] =
          +(
            teamStats.winrateMatches[mapName] / teamStats.totalMatches[mapName]
          ).toFixed(2) || 0;

        last50[mapName].map((soloStats) => {
          const soloAvg = soloStats.avg;
          const teamAvg = teamStats.avg[mapName];
          soloStats.cf = (1 + (soloAvg - teamAvg) / teamAvg) * 0.2;
          soloStats.points = +(soloStats.cf * soloStats.winrate * 10).toFixed(
            2
          );
        });
      });

      Object.keys(last50).map((mapName) => {
        last50[mapName] = {
          totalWinrate:
            +(
              teamStats.winrateMatches[mapName] /
              teamStats.totalMatches[mapName]
            ).toFixed(2) || 0,
          totalMatches: teamStats.totalMatches[mapName],
          totalPoints: +last50[mapName]
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
          team1Stats.last50[mapName].totalPoints,
          team2Stats.last50[mapName].totalPoints
        ),
        totalWinrate: calculateDifference(
          team1Stats.last50[mapName].totalWinrate,
          team2Stats.last50[mapName].totalWinrate
        ),
        totalMatches: calculateDifference(
          team1Stats.last50[mapName].totalMatches,
          team2Stats.last50[mapName].totalMatches
        ),
      });

      team2Result.push({
        mapName,
        totalPoints: calculateDifference(
          team2Stats.last50[mapName].totalPoints,
          team1Stats.last50[mapName].totalPoints
        ),
        totalWinrate: calculateDifference(
          team2Stats.last50[mapName].totalWinrate,
          team1Stats.last50[mapName].totalWinrate
        ),
        totalMatches: calculateDifference(
          team2Stats.last50[mapName].totalMatches,
          team1Stats.last50[mapName].totalMatches
        ),
      });
    });

    team1Result.sort((a, b) => b?.totalPoints - a?.totalPoints);
    team2Result.sort((a, b) => b?.totalPoints - a?.totalPoints);
  } catch (e) {
    console.log(e);
  }
}

async function sendMapPickerResult(
  dbPlayersTeam1,
  dbPlayersTeam2,
  team1Result,
  team2Result,
  team1Name,
  team2Name
) {
  if (!dbPlayersTeam1.length && !dbPlayersTeam2.length) return;
  try {
    const neededVariables = dbPlayersTeam1.length
      ? [dbPlayersTeam1, team1Result, team1Name]
      : [dbPlayersTeam2, team2Result, team2Name];
    let teamsToSendNotification = new Set();
    const opponentTeamName =
      neededVariables[2] === team1Name ? team2Name : team1Name;

    for await (const player of neededVariables[0]) {
      const teams = await Team.find({
        players: player._id,
      });

      teams.map(({ chat_id }) => {
        teamsToSendNotification.add(chat_id);
      });

      teamsToSendNotification.add(-886965844);
    }
    const tBot = getTelegramBot();

    const htmlMessage = prettifyMapPickerData(neededVariables);
    await sendPhoto(
      tBot,
      [...teamsToSendNotification],
      null,
      getBestMapsTemplate(htmlMessage, neededVariables[1][0].mapName)
    );

    const teammatesString = neededVariables[0]
      .map(({ nickname }) => `<b>${nickname}</b>`)
      .join(', ');
    const message = `Match <b>${neededVariables[2]}</b> vs <b>${opponentTeamName}</b> just created! Above, you can find the best maps for <b>${neededVariables[2]}</b> (${teammatesString} from your team).`;

    [...teamsToSendNotification].forEach((chat_id) => {
      tBot.sendMessage(chat_id, message, {
        parse_mode: 'html',
        ...mainMenuMarkup,
      });
    });
  } catch (e) {
    console.log(e);
  }
}
