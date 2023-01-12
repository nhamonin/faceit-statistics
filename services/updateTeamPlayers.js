import { Player, Team } from '#models';
import { getPlayerInfo } from '#utils';
import { messages, caches } from '#config';

export const updateTeamPlayers = async (chat_id) => {
  if (caches.updateTeamPlayers.has(chat_id)) return;
  caches.updateTeamPlayers.add(chat_id);
  setTimeout(() => {
    caches.updateTeamPlayers.delete(chat_id);
  }, 1000 * 5);
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return messages.teamNotExistError;
    const teamPlayerIDs = await team
      .populate('players')
      .then(({ players }) => players.map(({ player_id }) => player_id));
    const playersStats = await Promise.all(
      teamPlayerIDs.map((player_id) => getPlayerInfo({ playerID: player_id }))
    );

    for await (const {
      player_id,
      nickname,
      elo,
      lvl,
      last20KD,
      last50KD,
    } of playersStats) {
      await Player.findOneAndUpdate(
        { player_id },
        { nickname, elo, lvl, last20KD, last50KD }
      ).then(() => {});
    }

    return messages.updateTeamPlayers.success;
  } catch (e) {
    console.log(e.message);
    return messages.updateTeamPlayers.error;
  }
};
