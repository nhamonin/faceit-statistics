import database from '#db';
import { logEvent, withErrorHandling } from '#utils';

export const initTeam = async ({ id, first_name, username, title, type }) =>
  withErrorHandling(
    async () => {
      let team = await database.teams.readBy({ chat_id: id });
      if (!team) {
        team = {
          chat_id: id,
          type,
          username,
          first_name,
          title,
          settings: {
            lang: 'en',
            lastMatches: 20,
            subscriptions: {
              match_object_created: {
                calculateBestMaps: true,
              },
              match_status_finished: {
                summaryStats: true,
              },
            },
          },
        };

        await database.teams.create(team);
        logEvent({ username, title, id }, 'Init team');
      }

      return team;
    },
    {
      errorMessage: 'serverError',
    }
  )();
