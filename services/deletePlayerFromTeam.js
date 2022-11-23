import { Match, Player, Team } from '../models/index.js';
import { messages, CACHE } from '../config/config.js';
import { isPlayerTeamMember } from '../utils/index.js';

export const deletePlayer = async (playerNickname, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    const { players } = await team.populate('players');

    if (!isPlayerTeamMember(players, playerNickname)) {
      return messages.deletePlayer.notExists(playerNickname);
    }

    const noPlayersInTeamAfterDeletion = players.length === 1;

    const playerInDB = await Player.findOne({ nickname: playerNickname });

    return Team.findOneAndUpdate(
      { chat_id },
      {
        $pullAll: {
          players: [{ _id: playerInDB._id }],
        },
      }
    )
      .then(async () => {
        CACHE.value = new Set();
        const teams = await Team.find({
          players: [{ _id: playerInDB._id }],
        });
        if (teams.length) return;
        Player.findByIdAndRemove({ _id: playerInDB._id }, async () => {
          const { matches } = await playerInDB.populate('matches');

          for await (const match of matches) {
            const players = await Player.find({
              matches: { $elemMatch: { $eq: match._id } },
            });

            if (players.length) continue;

            Match.findByIdAndRemove({ _id: match._id }, () => {});
          }
        });
      })
      .then(() =>
        noPlayersInTeamAfterDeletion
          ? messages.deletePlayer.lastPlayerWasDeleted
          : messages.deletePlayer.success(playerNickname)
      );
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};
