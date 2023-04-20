import { clearInterval } from 'node:timers';

import database from '#db';
import { updateTeamPlayers } from '#services';
import {
  calculateBestMaps,
  performMapPickerAnalytics,
  getMatchData,
  handleSummaryStatsAutoSend,
  receiveArgs,
} from '#utils';
import { allowedCompetitionNames } from '#config';

const eventHandlers = new Map([
  ['match_object_created', handleMatchObjectCreated],
  ['match_status_finished', handleMatchStatusFinished],
]);

export default {
  '/faceit-webhook': {
    post: async (req, res) => {
      try {
        const data = await receiveArgs(req);
        const eventHandler = eventHandlers.get(data.event);

        if (eventHandler) {
          await eventHandler(data);
        } else {
          console.warn(`Unhandled event type: ${data.event}`);
        }

        res.statusCode = 200;
        res.end('OK');
      } catch (error) {
        console.error('Error handling Faceit webhook:', error);
        res.statusCode = error.message === 'Invalid team data' ? 404 : 500;
        res.end(
          error.message === 'Invalid team data'
            ? 'ERROR'
            : 'Internal Server Error'
        );
      }
    },
  },
};

async function handleMatchObjectCreated(data) {
  const match_id = data.payload.id;

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
        const prediction = await database.tempPredictions.readBy({
          match_id,
        });

        if (!prediction) {
          await database.tempPredictions.create({
            match_id,
            predictions,
          });
        }
      }
    }
  }, 4500);
}

async function handleMatchStatusFinished(data) {
  await performMapPickerAnalytics(data.payload.id);

  if (
    !data?.payload?.teams?.length ||
    !data.payload.teams[0]?.roster?.length ||
    !data.payload.teams[1]?.roster?.length
  ) {
    throw new Error('Invalid team data');
  }

  const playersRoster = [
    ...data.payload.teams[0].roster,
    ...data.payload.teams[1].roster,
  ];
  const playerIDs = playersRoster.map(({ id }) => id);
  const teamsToSendSummary = new Set();
  const updatedTeams = new Map();

  await updateTeamPlayers({ playerIDs });
  for (const player_id of playerIDs) {
    const teams = await database.teams.readAllByPlayerId(player_id);

    if (teams.length) {
      for (const team of teams) {
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

  await handleSummaryStatsAutoSend(data.payload.id, [...teamsToSendSummary]);
}
