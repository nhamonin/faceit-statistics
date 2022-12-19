import { Team } from '#models';
import { messages } from '#config';

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
      });
      await team.save();
    }

    const { players } = await team.populate('players');

    return players.map(({ nickname }) => nickname);
  } catch (e) {
    console.log(e.message);
    return messages.serverError;
  }
};
