import path from 'path';

import express from 'express';
import { Players, Matches } from 'faceit-node-api';

import { Team, Player } from '#models';
import { updateTeamPlayers } from '#services';
import {
  game_id,
  currentMapPool,
  allowedTeamsToGetMapPickerNotifications,
} from '#config';
import { getTelegramBot, calculateAverage } from '#utils';
import { clearInterval } from 'timers';

const cacheWinrate = new Set();
const cacheAvg = new Set();
const tBot = getTelegramBot();

export function webhookListener() {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.sendFile(
      path.join(process.cwd(), 'public', 'templates', '/index.html')
    );
  });

  app.post('/webhook', async (req, res) => {
    const data = req.body;

    console.log(
      `Webhook of type ${data.event} was received successfully!`,
      new Date().toLocaleString()
    );
    let playersIDs, playersNicknames;

    switch (data.event) {
      case 'match_status_finished':
        const playersRoster = [
          ...data.payload.teams[0].roster,
          ...data.payload.teams[1].roster,
        ];

        playersIDs = playersRoster.map(({ id }) => id);
        playersNicknames = playersRoster.map(({ nickname }) => nickname);

        for await (const player_id of playersIDs) {
          const teams = await Team.find({
            players: player_id,
          });

          if (teams.length) {
            for await (const team of teams) {
              updateTeamPlayers(team.chat_id);
            }
          }
        }
        break;
      case 'match_object_created':
        const match_id = data.payload.id;
        const matches = new Matches();
        const interval = setInterval(async () => {
          const matchData = await matches.getMatchDetails(match_id);

          if (matchData.teams.faction1 && matchData.teams.faction2) {
            clearInterval(interval);
            handleMatchObjectCreatedWinrate(matchData, cacheWinrate);
            handleMatchObjectCreatedAvg(matchData, cacheAvg);
          }
        }, 1000);
        break;
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}

export async function handleMatchObjectCreatedWinrate(data, cache = new Set()) {
  if (cacheWinrate.has(data.match_id)) return;
  cacheWinrate.add(data.match_id);
  setTimeout(() => {
    cacheWinrate.delete(data.match_id);
  }, 1000 * 60 * 5);

  try {
    const team1 = data.teams.faction1.roster;
    const team2 = data.teams.faction2.roster;
    const team1playersIDs = team1.map(({ player_id }) => player_id);
    const team2playersIDs = team2.map(({ player_id }) => player_id);
    const dbPlayersTeam1 = [];
    const dbPlayersTeam2 = [];
    const team1Stats = {
      lifetime: {},
    };
    const team2Stats = {
      lifetime: {},
    };
    const team1Result = [];
    const team2Result = [];
    const players = new Players();
    const teamsObj = {
      0: [team1playersIDs, dbPlayersTeam1, team1Stats],
      1: [team2playersIDs, dbPlayersTeam2, team2Stats],
    };

    [team1Stats, team2Stats].map(({ lifetime }) => {
      currentMapPool.map((map_id) => {
        lifetime[map_id] = [];
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
                      winrate: +stats['Win Rate %'],
                      matches: +stats['Matches'],
                    }))[0] || { winrate: 0, matches: 0 }
                );
              });
            });
        })
      );
    }

    [team1Stats, team2Stats].map(({ lifetime }) => {
      Object.keys(lifetime).map((mapName) => {
        const winrateMatches = lifetime[mapName].reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue?.winrate * currentValue?.matches,
          0
        );
        const totalMatches =
          lifetime[mapName].reduce(
            (accumulator, currentValue) => accumulator + currentValue?.matches,
            0
          ) || 0;

        lifetime[mapName] = {
          totalWinrate: +(winrateMatches / totalMatches).toFixed(2) || 0,
          totalMatches,
        };
      });
    });

    currentMapPool.map((mapName) => {
      team1Result.push({
        mapName,
        totalWinrate: +(
          team1Stats.lifetime[mapName]?.totalWinrate -
          team2Stats.lifetime[mapName]?.totalWinrate
        ).toFixed(2),
        totalMatches:
          team1Stats.lifetime[mapName]?.totalMatches -
          team2Stats.lifetime[mapName]?.totalMatches,
      });

      team2Result.push({
        mapName,
        totalWinrate: +(
          team2Stats.lifetime[mapName]?.totalWinrate -
          team1Stats.lifetime[mapName]?.totalWinrate
        ).toFixed(2),
        totalMatches:
          team2Stats.lifetime[mapName]?.totalMatches -
          team1Stats.lifetime[mapName]?.totalMatches,
      });
    });

    team1Result.sort((a, b) => b?.totalWinrate - a?.totalWinrate);
    team2Result.sort((a, b) => b?.totalWinrate - a?.totalWinrate);

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
      })
    }

    [...new Set([...teamsToSendNotification, 146612362])]
      .filter((chat_id) =>
        allowedTeamsToGetMapPickerNotifications.includes(chat_id)
      )
      .map((chat_id) => {
        tBot.sendMessage(chat_id, prettifyMapPickerData(neededVariables, 'matches/winrate'));
      });
  } catch (e) {
    console.log(e);
  }
}

export async function handleMatchObjectCreatedAvg(data, cache = new Set()) {
  if (cacheAvg.has(data.match_id)) return;
  cacheAvg.add(data.match_id);
  setTimeout(() => {
    cacheAvg.delete(data.match_id);
  }, 1000 * 60 * 5);

  try {
    const team1 = data.teams.faction1.roster;
    const team2 = data.teams.faction2.roster;
    const team1playersIDs = team1.map(({ player_id }) => player_id);
    const team2playersIDs = team2.map(({ player_id }) => player_id);
    const dbPlayersTeam1 = [];
    const dbPlayersTeam2 = [];
    const team1Stats = {
      lifetime: {},
      avg: {}
    };
    const team2Stats = {
      lifetime: {},
      avg: {}
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
      })
    });

    [team1Stats, team2Stats].map((teamStats) => {
      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.lifetime[mapName].map((soloStats) => {
          const soloAvg = soloStats.avg;
          const teamAvg = teamStats.avg[mapName];
          soloStats.cf = (1 + ((soloAvg - teamAvg) / teamAvg)) * 0.2;
          soloStats.points = +(soloStats.cf * soloStats.winrate * 10).toFixed(2);
        })
      })

      Object.keys(teamStats.lifetime).map((mapName) => {
        teamStats.lifetime[mapName] = +(teamStats.lifetime[mapName].map(({ points }) => points).reduce((a, b) => a + b, 0)).toFixed(2);
      });
    });

    currentMapPool.map((mapName) => {
      team1Result.push({
        mapName,
        totalPoints:
          +(team1Stats.lifetime[mapName] -
          team2Stats.lifetime[mapName]).toFixed(2)
      });

      team2Result.push({
        mapName,
        totalPoints:
          +(team2Stats.lifetime[mapName] -
            team1Stats.lifetime[mapName]).toFixed(2)
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
      })
    }

    [...new Set([...teamsToSendNotification, 146612362])]
      .filter((chat_id) =>
        allowedTeamsToGetMapPickerNotifications.includes(chat_id)
      )
      .map((chat_id) => {
        tBot.sendMessage(chat_id, prettifyMapPickerData(neededVariables, 'avg/winrate'));
      });
  } catch (e) {
    console.log(e);
  }
}


function prettifyMapPickerData(neededVariables, basedOn) {
  return [
    `Best maps based on ${basedOn} for: ` +
      neededVariables[0].map(({ nickname }) => nickname).join(', ') +
      ':',
    '',
    ...neededVariables[1].map(
      ({ mapName, totalWinrate, totalMatches, totalPoints }) =>
        totalWinrate && totalMatches ?
          `${mapName} | ${totalWinrate}% | ${totalMatches}` :
          `${mapName} | ${totalPoints}`
    ),
  ].join('\n');
}

function regulateWinrate(value) {
  if (value <= 65 && value >= 35) {
    return value;
  } else if (value >= 65) {
    return 65;
  } else {
    return 35;
  }
}

function regulateAvg(value) {
  if (value <= 25 && value >= 15) {
    return value;
  } else if (value >= 25) {
    return 25;
  } else {
    return 15;
  }
}