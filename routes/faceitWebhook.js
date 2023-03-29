import { clearInterval } from 'node:timers';

import express from 'express';

import { updateTeamPlayers } from '#services';
import {
  db,
  getTeamsByPlayerId,
  calculateBestMaps,
  performMapPickerAnalytics,
  getMatchData,
  handleSummaryStatsAutoSend,
} from '#utils';
import { allowedCompetitionNames } from '#config';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const data = req.body;
  const match_id = data.payload.id;

  switch (data.event) {
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
            const prediction = await db('temp_prediction')
              .where({ match_id })
              .first();

            if (!prediction) {
              try {
                await db('temp_prediction').insert({
                  match_id,
                  predictions: JSON.stringify(predictions),
                });
              } catch (e) {
                console.log(e);
              }
            }
          }
        }
      }, 4500);
      break;
    case 'match_status_finished':
      await performMapPickerAnalytics(match_id);
      if (
        !data?.payload?.teams?.length ||
        !data.payload.teams[0]?.roster?.length ||
        !data.payload.teams[1]?.roster?.length
      ) {
        res.sendStatus(404);
        return;
      }
      const playersRoster = [
        ...data.payload.teams[0].roster,
        ...data.payload.teams[1].roster,
      ];
      const playersIDs = playersRoster.map(({ id }) => id);
      const teamsToSendSummary = new Set();
      const updatedTeams = new Map();

      for await (const player_id of playersIDs) {
        const teams = await getTeamsByPlayerId(player_id);

        if (teams.length) {
          for await (const team of teams) {
            await updateTeamPlayers(team.chat_id);

            updatedTeams.set(team.chat_id, team);
            teamsToSendSummary.add(team.chat_id);
          }
        }
      }

      if (updatedTeams.size) {
        console.log(
          `Players of the teams: ${[...updatedTeams.values()]
            .map(({ username, title, chat_id }) => username || title || chat_id)
            .join(',')} were updated.`,
          new Date().toLocaleString()
        );
      }

      await handleSummaryStatsAutoSend(match_id, [...teamsToSendSummary]);
      break;
  }

  res.sendStatus(200);
});

export default router;
