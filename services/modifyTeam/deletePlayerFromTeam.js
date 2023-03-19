import { Player, Team } from '#models';
import { isPlayerTeamMember, webhookMgr, getTeamNicknames } from '#utils';

export const deletePlayer = async (playerNickname, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return { text: 'teamNotExistsError' };
    const { players } = await team.populate('players');

    if (!isPlayerTeamMember(players, playerNickname)) {
      return {
        text: 'deletePlayer.notExists',
        options: { nickname: playerNickname },
      };
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
          ? { text: 'deletePlayer.lastWasDeleted' }
          : {
              text: 'deletePlayer.success',
              options: {
                nickname: playerNickname,
                teamNicknames: getTeamNicknames(updatedTeam).join(', '),
              },
            };
      });
  } catch (e) {
    console.log(e);
    return { text: 'serverError' };
  }
};
