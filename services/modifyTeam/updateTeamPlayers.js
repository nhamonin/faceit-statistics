import { Player, Team } from '#models';
import { getPlayerInfo } from '#utils';
import { caches } from '#config';
import strings from '#strings';

export const updateTeamPlayers = async (chat_id) => {
  if (caches.updateTeamPlayers.has(chat_id)) return;
  caches.updateTeamPlayers.add(chat_id);
  setTimeout(() => {
    caches.updateTeamPlayers.delete(chat_id);
  }, 1000 * 5);
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return strings.teamNotExistError;
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
      kd,
      avg,
      hs,
      winrate,
    } of playersStats) {
      await Player.findOneAndUpdate(
        { player_id },
        { nickname, elo, lvl, kd, avg, hs, winrate }
      ).then(({ elo, highestElo, highestEloDate }) => {
        if (highestElo && highestEloDate && elo >= highestElo) {
          Player.findOneAndUpdate(
            { player_id },
            { highestElo: elo, highestEloDate: new Date() }
          ).then(() => {});
        }
      });
    }

    return strings.updateTeamPlayers.success;
  } catch (e) {
    console.log(e.message);
    return strings.updateTeamPlayers.error;
  }
};
