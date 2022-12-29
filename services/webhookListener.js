import path from 'path';

import express from 'express';
import { Matches } from 'faceit-node-api';

import { Team, Match, MatchPrediction } from '#models';
import { updateTeamPlayers } from '#services';
import { calculateBestMaps, getCurrentWinrate } from '#utils';
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
          await performMapPickerAnalytics(match_id);
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

              setTimeout(() => {
                predictions.delete(match_id);
              }, 1000 * 3600 * 24);
            }
          }, 1000);
        }
        break;
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}

async function performMapPickerAnalytics(match_id) {
  if (predictions.has(match_id)) {
    const matchData = await matches.getMatchDetails(match_id);
    const winner = matchData.results.winner;
    const pickedMap = matchData.voting.map.pick[0];
    if (pickedMap === 'de_anubis') return;
    const predictedData = predictions
      .get(match_id)
      [winner === 'faction1' ? 0 : 1].filter(
        (predictionObj) => predictionObj.mapName === pickedMap
      )[0];
    const match = new Match({
      match_id,
      winratePredictedValue: predictedData.totalWinrate > 0,
      avgPredictedValue: predictedData.totalPoints > 0,
    });
    match.save().then(async () => {
      let matchPrediction = await MatchPrediction.findOne();
      if (!matchPrediction) {
        matchPrediction = new MatchPrediction({
          matches: [match],
        });
        matchPrediction.avgMatchesPrediction = {
          currentWinrate: getCurrentWinrate([match], 'avg'),
        };
        matchPrediction.winrateMatchesPrediction = {
          currentWinrate: getCurrentWinrate([match], 'winrate'),
        };
      } else {
        matchPrediction.matches?.push(match);
        const { matches } = await matchPrediction.populate('matches');
        matchPrediction.avgMatchesPrediction = {
          currentWinrate: getCurrentWinrate(matches, 'avg'),
        };
        matchPrediction.winrateMatchesPrediction = {
          currentWinrate: getCurrentWinrate(matches, 'winrate'),
        };
      }
      matchPrediction.save();
      predictions.delete(match_id);
    });
  }
}
