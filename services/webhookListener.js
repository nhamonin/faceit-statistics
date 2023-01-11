import path from 'path';

import express from 'express';
import { Matches } from 'faceit-node-api';

import { Team, Match, MatchPrediction, TempPrediction } from '#models';
import { updateTeamPlayers } from '#services';
import { calculateBestMaps, getCurrentWinrate } from '#utils';
import { clearInterval } from 'timers';
import { allowedCompetitionNames, currentMapPool } from '#config';

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

    let playersIDs, playersNicknames;
    const matches = new Matches();

    switch (data.event) {
      case 'match_status_finished':
        {
          const match_id = data.payload.id;
          await performMapPickerAnalytics(match_id, matches);
          if (
            !data?.payload?.teams?.length ||
            !data.payload.teams[0]?.roster?.length ||
            !data.payload.teams[1]?.roster?.length
          )
            return;
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

              console.log(
                `Players of the teams: ${teams
                  .map(({ username, title }) => username || title)
                  .join(',')} were updated.`,
                new Date().toLocaleString()
              );
            }
          }
        }
        break;
      case 'match_object_created':
        {
          const match_id = data.payload.id;
          const interval = setInterval(async () => {
            const matchData = await matches.getMatchDetails(match_id);
            const allowedCompetitionName = allowedCompetitionNames.includes(
              matchData.competition_name
            );
            if (
              matchData?.teams?.faction1 &&
              matchData?.teams?.faction2 &&
              allowedCompetitionName
            ) {
              clearInterval(interval);

              const predictions = await calculateBestMaps(matchData);
              if (predictions?.length) {
                const prediction = await TempPrediction.findOne({ match_id });

                if (!prediction) {
                  const newPrediction = new TempPrediction({
                    match_id,
                    predictions,
                  });
                  await newPrediction.save();
                }
              }
            }
          }, 1000);

          setTimeout(() => {
            clearInterval(interval);
          }, 1000 * 60);
        }
        break;
    }

    res.sendStatus(200);
  });

  app.listen(80, () => {});
}

async function performMapPickerAnalytics(match_id, matches) {
  try {
    const tempPrediction = await TempPrediction.findOne({ match_id });
    if (!tempPrediction) return;
    const { predictions } = tempPrediction;
    if (!predictions) return;
    const matchData = await matches.getMatchDetails(match_id);
    const winner = matchData?.results?.winner;
    const pickedMap = matchData?.voting?.map?.pick[0];
    if (!pickedMap && !winner && !currentMapPool.includes(pickedMap)) return;
    const predictedDataTeam = predictions[winner === 'faction1' ? 0 : 1];
    if (!predictedDataTeam) return;
    const predictedDataMap = predictedDataTeam.filter(
      (predictionObj) => predictionObj.mapName === pickedMap
    )[0];
    if (!predictedDataMap) return;
    const match = new Match({
      match_id,
      winratePredictedValue: predictedDataMap.totalWinrate > 0,
      avgPredictedValue: predictedDataMap.totalPoints > 0,
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
      await TempPrediction.findOneAndDelete({ match_id });
    });
  } catch (e) {
    console.log(e);
  }
}
