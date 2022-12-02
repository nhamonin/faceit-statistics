import express from 'express';

export function webhookListener() {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.post('/webhook', async (req, res) => {
    const data = req.body;

    if (data.event === 'match_status_finished') {
      console.log('match finished webhook received');

      const playedPlayersID = [
        ...data.teams[0].roster,
        ...data.teams[1].roster,
      ].map(({ player_id }) => player_id);

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

  app.listen(9000, () => console.log('Node.js server started on port 9000.'));
}
