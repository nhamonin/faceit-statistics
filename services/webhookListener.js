import path from 'path';

import express from 'express';
import { Matches } from 'faceit-node-api';

import { Team } from '#models';
import { updateTeamPlayers } from '#services';
import { calculateBestMaps } from '#utils';
import { clearInterval } from 'timers';

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

            calculateBestMaps(matchData);
          }
        }, 1000);
        break;
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}
