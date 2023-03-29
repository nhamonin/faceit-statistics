import { db } from '#utils';
import { logEvent } from '#utils';

export const initTeam = async ({ id, first_name, username, title, type }) => {
  try {
    let team = await db('team').where({ chat_id: id }).first();

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

      await db('team').insert(team);
      logEvent({ username, title, id }, 'Init team');
    }

    return team;
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
