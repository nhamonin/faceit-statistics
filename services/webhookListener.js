import path from 'path';

import express from 'express';
import { Players } from 'faceit-node-api';

import { Team, Player } from '#models';
import { updateTeamPlayers } from '#services';
import { game_id, currentMapPool } from '#config';
// import { getTelegramBot } from '#utils';

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
      `Webhook of type ${data.event} received successfully!`,
      new Date().toLocaleString()
    );
    let playersIDs, playersNicknames;

    switch (data.event) {
      case 'match_status_finished':
        players = [
          ...data.payload.teams[0].roster,
          ...data.payload.teams[1].roster,
        ];

        playersIDs = players.map(({ id }) => id);
        playersNicknames = players.map(({ nickname }) => nickname);
        console.log(playersNicknames);

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
      case 'match_status_ready':
        const team1 = data.payload.teams[0].roster;
        const team2 = data.payload.teams[1].roster;
        const team1playersIDs = team1.map(({ id }) => id);
        const team2playersIDs = team2.map(({ id }) => id);
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

          for await (const player_id of variablesArr[0]) {
            const player = await Player.findOne({ player_id });
            if (player) variablesArr[1].push(player.nickname);
            const stats = await players.getStatisticsOfAPlayer(
              player_id,
              game_id
            );
            currentMapPool.map((map_id) => {
              variablesArr[2].lifetime[map_id].push(
                stats.segments
                  .filter(
                    ({ mode, label }) => mode === '5v5' && label === map_id
                  )
                  .map(({ stats }) => ({
                    winrate: +stats['Win Rate %'],
                    matches: +stats['Matches'],
                  }))[0]
              );
            });
          }
        }

        [team1Stats, team2Stats].map(({ lifetime }) => {
          Object.keys(lifetime).map((mapName) => {
            const winrateMatches = lifetime[mapName].reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.winrate * currentValue.matches,
              0
            );
            const totalMatches = lifetime[mapName].reduce(
              (accumulator, currentValue) => accumulator + currentValue.matches,
              0
            );

            lifetime[mapName] = {
              totalWinrate: +(winrateMatches / totalMatches).toFixed(2),
              totalMatches,
            };
          });
        });

        currentMapPool.map((mapName) => {
          team1Result.push({
            mapName,
            totalWinrate: +(
              team1Stats.lifetime[mapName].totalWinrate -
              team2Stats.lifetime[mapName].totalWinrate
            ).toFixed(2),
            totalMatches:
              team1Stats.lifetime[mapName].totalMatches -
              team2Stats.lifetime[mapName].totalMatches,
          });

          team2Result.push({
            mapName,
            totalWinrate: +(
              team2Stats.lifetime[mapName].totalWinrate -
              team1Stats.lifetime[mapName].totalWinrate
            ).toFixed(2),
            totalMatches:
              team2Stats.lifetime[mapName].totalMatches -
              team1Stats.lifetime[mapName].totalMatches,
          });
        });

        team1Result.sort((a, b) => b.totalWinrate - a.totalWinrate);
        team2Result.sort((a, b) => b.totalWinrate - a.totalWinrate);
        break;
    }

    console.log(dbPlayersTeam1, dbPlayersTeam2, team1Result, team2Result);

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}
