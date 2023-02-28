import {
  isPlayerTeamMember,
  getPlayerInfo,
  getTeamNicknames,
  webhookMgr,
} from '#utils';
import { Player, Team } from '#models';
import { MAX_PLAYERS_AMOUNT } from '#config';
import strings from '#strings';

export const addPlayer = async (playerNickname, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    if (!team) return strings.teamNotExistError;
    const { players } = await team.populate('players');
    const playerInDB = await Player.findOne({ nickname: playerNickname });
    const playersNicknames = getTeamNicknames(team).join(', ');
    if (players?.length + 1 > MAX_PLAYERS_AMOUNT)
      return strings.addPlayer.tooMany(playersNicknames);

    if (isPlayerTeamMember(players, playerNickname)) {
      return strings.addPlayer.exists(playerNickname, playersNicknames);
    } else if (playerInDB) {
      team.players.push(playerInDB);
      console.log(
        `Player ${playerInDB.nickname} was added to the team from the DB.`,
        new Date().toLocaleString()
      );
    } else {
      const playerInfo = await getPlayerInfo({
        playerNickname,
        playersNicknames,
      });
      const {
        player_id,
        nickname,
        elo,
        lvl,
        last20KD,
        last50KD,
        error,
        errorMessage,
      } = playerInfo;
      if (error) return errorMessage;
      const player = new Player({
        _id: player_id,
        player_id,
        nickname,
        elo,
        lvl,
        last20KD,
        last50KD,
      });
      player.save().then(() => {
        webhookMgr.addPlayersToList([player.player_id]);
        console.log(
          `Player ${player.nickname} was added to the team from the Faceit API.`,
          new Date().toLocaleString()
        );
      });
      team.players.push(player);
    }
    return team
      .save()
      .then((team) =>
        strings.addPlayer.success(
          playerNickname,
          getTeamNicknames(team).join(', ')
        )
      );
  } catch (e) {
    console.log(e.message);
    return strings.serverError;
  }
};
