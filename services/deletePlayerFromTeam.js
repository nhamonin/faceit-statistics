import { Player, Team } from '../models/index.js';
import { messages } from '../config/config.js';
import { isPlayerTeamMember, webhookMgr } from '../utils/index.js';

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
        const teams = await Team.find({
          players: [{ _id: playerInDB._id }],
        });
        if (teams.length) return;
        Player.findByIdAndRemove({ _id: playerInDB._id }, () => {
          webhookMgr.removePlayersFromList([playerInDB.player_id]);
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
