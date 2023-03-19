import { Team } from '#models';
import { logEvent } from '#utils';

export const initTeam = async ({ id, first_name, username, title, type }) => {
  try {
    let team = await Team.findOne({ chat_id: id });

    if (!team) {
      team = new Team({
        chat_id: id,
        type,
        username,
        first_name,
        title,
        players: [],
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
      });
      logEvent({ username, title, id }, 'Init team');
      await team.save();
    }

    return team;
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
