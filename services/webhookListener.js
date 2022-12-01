import express from 'express';

export function webhookListener() {
  const app = express();
  app.use(express.json());

  app.post('/webhook', async (req, res) => {
    const data = req.body;

    if (data.event === 'match_status_finished') {
      console.log('match finished webhook received');

      const playedPlayersNicknames = [
        ...data.teams[0].roster,
        ...data.teams[1].roster,
      ].map(({ nickname }) => nickname);

      for await (const nickname of playedPlayersNicknames) {
        const teams = await Team.find({
          players: [{ nickname }],
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
