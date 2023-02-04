import express from 'express';

import { TempPrediction, Team } from '#models';
import { updateTeamPlayers } from '#services';
import {
  calculateBestMaps,
  performMapPickerAnalytics,
  getMatchData,
} from '#utils';
import { clearInterval } from 'timers';
import { allowedCompetitionNames } from '#config';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const data = req.body;
  const match_id = data.payload.id;

  switch (data.event) {
    case 'match_status_finished':
      await performMapPickerAnalytics(match_id);
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
      const playersIDs = playersRoster.map(({ id }) => id);

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
      break;
    case 'match_object_created':
      let maxIntervalCount = 15;
      const interval = setInterval(async () => {
        maxIntervalCount--;
        if (!maxIntervalCount) clearInterval(interval);
        const matchData = await getMatchData(match_id);
        const allowedCompetitionName = allowedCompetitionNames.includes(
          matchData?.payload?.entity?.name
        );
        if (!allowedCompetitionName) clearInterval(interval);
        if (
          matchData?.payload?.teams?.faction1 &&
          matchData?.payload?.teams?.faction2 &&
          allowedCompetitionName
        ) {
          clearInterval(interval);
          const predictions = await calculateBestMaps(matchData);
          if (predictions?.length) {
            const prediction = await TempPrediction.findOne({ match_id });

            if (!prediction) {
              try {
                const newPrediction = new TempPrediction({
                  match_id,
                  predictions,
                });
                await newPrediction.save();
              } catch (e) {}
            }
          }
        }
      }, 4500);
      break;
  }

  res.sendStatus(200);
});

export default router;
