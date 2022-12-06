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
    console.log(data);

    console.log(
      `Webhook of type ${data.event} received successfully!`,
      new Date().toLocaleString()
    );

    if (data.event === 'match_status_finished') {
      const players = [
        ...data.payload.teams[0].roster,
        ...data.payload.teams[1].roster,
      ];

      const playedPlayersID = players.map(({ id }) => id);
      const playedPlayersNicknames = players.map(({ nickname }) => nickname);

      console.log(playedPlayersNicknames);

      for await (const player_id of playedPlayersID) {
        const teams = await Team.find({
          players: player_id,
        });

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
