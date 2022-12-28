import path from 'path';

import express from 'express';
import { Matches } from 'faceit-node-api';

import { Team, Match, MatchPrediction } from '#models';
import { updateTeamPlayers } from '#services';
import { calculateBestMaps } from '#utils';
import { clearInterval } from 'timers';

const matches = new Matches();
const predictions = new Map();

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
        {
          const match_id = data.payload.id;
          if (predictions.has(match_id)) {
            const matchData = await matches.getMatchDetails(match_id);
            const winner = matchData.results.winner;
            const pickedMap = matchData.voting.map.pick;
            const predictedData = predictions
              .get(match_id)
              [winner === 'faction1' ? 0 : 1].filter(
                (predictionObj) => predictionObj.mapName === pickedMap
              );
            const match = new Match({
              match_id,
              winratePredictedValue: predictedData.totalWinrate > 0,
              avgPredictedValue: predictedData.totalPoints > 0,
            });
            console.log(match);
            match.save().then(async () => {
              const matchPrediction = await MatchPrediction.findOneAndUpdate();
              console.log(matchPrediction);
              matchPrediction?.matches?.push(match);
              predictions.delete(match_id);
            });
          }

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
        }
        break;
      case 'match_object_created':
        {
          const match_id = data.payload.id;
          const interval = setInterval(async () => {
            const matchData = await matches.getMatchDetails(match_id);

            if (matchData.teams.faction1 && matchData.teams.faction2) {
              clearInterval(interval);

              const prediction = await calculateBestMaps(matchData);
              predictions.set(match_id, prediction);
            }
          }, 1000);
        }
        break;
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}
