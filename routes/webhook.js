import express from 'express';
import { Matches } from 'faceit-node-api';

import { TempPrediction, Team } from '#models';
import { updateTeamPlayers } from '#services';
import { calculateBestMaps, performMapPickerAnalytics } from '#utils';
import { clearInterval } from 'timers';
import { allowedCompetitionNames } from '#config';

const router = express.Router();

router.post('/webhook', async (req, res) => {
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
        let maxIntervalCount = 10;
        const interval = setInterval(async () => {
          maxIntervalCount--;
          if (!maxIntervalCount) clearInterval(interval);
          const matchData = await matches.getMatchDetails(match_id);
          const allowedCompetitionName = allowedCompetitionNames.includes(
            matchData?.competition_name
          );
          if (!allowedCompetitionName) clearInterval(interval);
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
        }, 3000);
      }
      break;
  }

  res.sendStatus(200);
});

export default router;