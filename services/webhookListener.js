import path from 'path';

import express from 'express';

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

    console.log(`Webhook of type ${data.event} received successfully!`)

    if (data.event === 'match_status_finished') {
      console.log('match finished webhook received');

      const playedPlayersID = [
        ...data.teams[0].roster,
        ...data.teams[1].roster,
      ].map(({ id }) => id);

      for await (const player_id of playedPlayersID) {
        const teams = await Team.find({
          players: player_id,
        });

        if (!teams.length) {
          res.sendStatus(404);
          return;
        }

        for await (const team of teams) {
          updateTeamPlayers(team.chat_id);
        }
      }
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}
