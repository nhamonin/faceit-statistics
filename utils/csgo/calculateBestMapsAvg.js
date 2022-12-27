import { Players } from 'faceit-node-api';

import { Team, Player } from '#models';
import {
  regulateWinrate,
  regulateAvg,
  prettifyMapPickerData,
  calculateAverage,
  getTelegramBot,
} from '#utils';
import {
  game_id,
  currentMapPool,
  allowedTeamsToGetMapPickerNotifications,
} from '#config';

const tBot = getTelegramBot();
const cache = new Set();

export async function calculateBestMapsAvg(matchData) {
  if (cache.has(matchData.match_id)) return;
  cache.add(matchData.match_id);
  setTimeout(() => {
    cache.delete(matchData.match_id);
  }, 1000 * 60 * 5);

  try {
    const team1 = matchData.teams.faction1.roster;
    const team2 = matchData.teams.faction2.roster;
    const team1playersIDs = team1.map(({ player_id }) => player_id);
    const team2playersIDs = team2.map(({ player_id }) => player_id);
    const dbPlayersTeam1 = [];
    const dbPlayersTeam2 = [];
    const team1Stats = {
      lifetime: {},
      avg: {},
    };
    const team2Stats = {
      lifetime: {},
      avg: {},
    };
    const team1Result = [];
    const team2Result = [];
    const players = new Players();
    const teamsObj = {
      0: [team1playersIDs, dbPlayersTeam1, team1Stats],
      1: [team2playersIDs, dbPlayersTeam2, team2Stats],
    };

    [team1Stats, team2Stats].map(({ lifetime, avg }) => {
      currentMapPool.map((map_id) => {
        lifetime[map_id] = [];
        avg[map_id] = [];
      });
    });

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
              currentMapPool.map((map_id) => {
                variablesArr[2].lifetime[map_id].push(
                  stats.segments
                    .filter(
                      ({ mode, label }) => mode === '5v5' && label === map_id
                    )
                    .map(({ stats }) => ({
                      winrate: regulateWinrate(+stats['Win Rate %']),
                      avg: regulateAvg(+stats['Average Kills']),
                    }))[0] || { winrate: 50, avg: 20 }
                );
              });
            });
        })
      );
    }

    [team1Stats, team2Stats].map((teamStats) => {
      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.avg[mapName] = calculateAverage(
          teamStats.lifetime[mapName].map(({ avg }) => avg),
          10
        );
      });
    });

    [team1Stats, team2Stats].map((teamStats) => {
      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.lifetime[mapName].map((soloStats) => {
          const soloAvg = soloStats.avg;
          const teamAvg = teamStats.avg[mapName];
          soloStats.cf = (1 + (soloAvg - teamAvg) / teamAvg) * 0.2;
          soloStats.points = +(soloStats.cf * soloStats.winrate * 10).toFixed(
            2
          );
        });
      });

      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.lifetime[mapName] = +teamStats.lifetime[mapName]
          .map(({ points }) => points)
          .reduce((a, b) => a + b, 0)
          .toFixed(2);
      });
    });

    currentMapPool.map((mapName) => {
      team1Result.push({
        mapName,
        totalPoints: +(
          team1Stats.lifetime[mapName] - team2Stats.lifetime[mapName]
        ).toFixed(2),
      });

      team2Result.push({
        mapName,
        totalPoints: +(
          team2Stats.lifetime[mapName] - team1Stats.lifetime[mapName]
        ).toFixed(2),
      });
    });

    team1Result.sort((a, b) => b?.totalPoints - a?.totalPoints);
    team2Result.sort((a, b) => b?.totalPoints - a?.totalPoints);

    const neededVariables = dbPlayersTeam1.length
      ? [dbPlayersTeam1, team1Result]
      : [dbPlayersTeam2, team2Result];
    const teamsToSendNotification = new Set();

    for await (const player of neededVariables[0]) {
      const teams = await Team.find({
        players: player._id,
      });

      teams.map(({ chat_id }) => {
        teamsToSendNotification.add(chat_id);
      });
    }

    [...new Set([...teamsToSendNotification, 146612362])]
      .filter((chat_id) =>
        allowedTeamsToGetMapPickerNotifications.includes(chat_id)
      )
      .map((chat_id) => {
        tBot.sendMessage(
          chat_id,
          prettifyMapPickerData(neededVariables, 'avg/winrate')
        );
      });
  } catch (e) {
    console.log(e);
  }
}
