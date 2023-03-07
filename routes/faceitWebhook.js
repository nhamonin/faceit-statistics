import { clearInterval } from 'node:timers';

import express from 'express';

import { TempPrediction, Team } from '#models';
import { updateTeamPlayers, getSummaryStats } from '#services';
import {
  calculateBestMaps,
  performMapPickerAnalytics,
  getMatchData,
  telegramSendMessage,
  sendPhoto,
} from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { allowedCompetitionNames, teamTesters, bots } from '#config';
import { getStatsMarkup } from '#telegramReplyMarkup';
import strings from '#strings';

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
        const teams = await Team.find({
          players: player_id,
        });

        if (teams.length) {
          for await (const team of teams) {
            await updateTeamPlayers(team.chat_id);

            updatedTeams.set(team.chat_id, team);
            if (teamTesters.includes(team.chat_id))
              teamsToSendSummary.add(team.chat_id);
          }
        }
      }

      console.log(
        `Players of the teams: ${[...updatedTeams.values()]
          .map(({ username, title, chat_id }) => username || title || chat_id)
          .join(',')} were updated.`,
        new Date().toLocaleString()
      );

      await sendSummaryStatsWrapper([...teamsToSendSummary]);
      break;
  }

  res.sendStatus(200);
});

async function sendSummaryStatsWrapper(chatIDs) {
  const summaryStatsArr = await Promise.all(chatIDs.map(getSummaryStats));

  for await (const [index, { message, error }] of summaryStatsArr.entries()) {
    if (error) {
      await telegramSendMessage(chatIDs[index], message);
    } else {
      await sendPhoto(
        bots.telegram,
        [chatIDs[index]],
        null,
        getSummaryStatsTemplate(message)
      );

      await telegramSendMessage(
        chatIDs[index],
        strings.selectOnOfTheOptions(true),
        {
          ...getStatsMarkup,
        }
      );
    }
  }
}

export default router;
