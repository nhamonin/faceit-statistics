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

export default {
  '/faceit-webhook': {
    post: async (req, res) => {
      const data = await receiveArgs(req);
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
                const prediction = await database.tempPredictions.readBy({});

                if (!prediction) {
                  try {
                    await database.tempPredictions.create({
                      match_id,
                      predictions,
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
            res.statusCode = 404;
            res.end('ERROR');
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
            const teams = await database.teams.readAllByPlayerId(player_id);

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
                .map(
                  ({ username, title, chat_id }) => username || title || chat_id
                )
                .join(',')} were updated.`,
              new Date().toLocaleString()
            );
          }

          await handleSummaryStatsAutoSend(match_id, [...teamsToSendSummary]);
          break;
      }

      res.statusCode = 200;
      res.end('OK');
    },
  },
};
