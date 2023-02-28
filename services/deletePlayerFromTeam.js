import { Player, Team } from '#models';
import strings from '#strings';
import { isPlayerTeamMember, webhookMgr, getTeamNicknames } from '#utils';

export const deletePlayer = async (playerNickname, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return strings.teamNotExistError;
    const { players } = await team.populate('players');

    if (!isPlayerTeamMember(players, playerNickname)) {
      return strings.deletePlayer.notExists(playerNickname);
    }

    const noPlayersInTeamAfterDeletion = players.length === 1;

    const playerInDB = await Player.findOne({ nickname: playerNickname });

    return await Team.findOneAndUpdate(
      { chat_id },
      {
        $pullAll: {
          players: [{ _id: playerInDB._id }],
        },
      }
    )
      .then(async () => {
        const teams = await Team.find({
          players: playerInDB._id,
        });
        if (teams.length) return;
        Player.findByIdAndRemove({ _id: playerInDB._id }, () => {
          webhookMgr.removePlayersFromList([playerInDB.player_id]);
        });
      })
      .then(async () => {
        const updatedTeam = await Team.findOne({ chat_id });
        await updatedTeam.populate('players');

        return noPlayersInTeamAfterDeletion
          ? strings.deletePlayer.lastPlayerWasDeleted
          : strings.deletePlayer.success(
              playerNickname,
              getTeamNicknames(updatedTeam).join(', ')
            );
      });
  } catch (e) {
    console.log(e.message);
    return strings.serverError;
  }
};
