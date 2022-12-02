import path from 'path';

import express from 'express';

import { Team } from '../models/index.js';
import { updateTeamPlayers } from '../services/index.js';

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

    console.log(`Webhook of type ${data.event} received successfully!`);

    if (data.event === 'match_status_finished') {
      console.log('match finished webhook received');

      const playedPlayersID = [
        ...data.payload.teams[0].roster,
        ...data.payload.teams[1].roster,
      ].map(({ id }) => id);

      // TODO: delete
      console.log(playedPlayersID);

      for await (const player_id of playedPlayersID) {
        const teams = await Team.find({
          players: player_id,
        });

        // TODO: delete
        console.log(teams, player_id);

        if (teams.length) {
          for await (const team of teams) {
            updateTeamPlayers(team.chat_id);
          }
        }
      }
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}
