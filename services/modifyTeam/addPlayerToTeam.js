import {
  isPlayerTeamMember,
  getPlayerInfo,
  getTeamNicknames,
  webhookMgr,
} from '#utils';
import { Player, Team } from '#models';
import { MAX_PLAYERS_AMOUNT } from '#config';
import { getHighestElo } from '#services';

export const addPlayer = async (playerNickname, chat_id) => {
  try {
    let team = await Team.findOne({ chat_id });
    if (!team) return { text: 'teamNotExistError' };
    const { players } = await team.populate('players');
    const playerInDB = await Player.findOne({ nickname: playerNickname });
    const playersNicknames = getTeamNicknames(team).join(', ');
    if (players?.length + 1 > MAX_PLAYERS_AMOUNT)
      return {
        text: 'addPlayer.maxPlayersAmount',
        options: { playersNicknames },
      };

    if (isPlayerTeamMember(players, playerNickname)) {
      return {
        text: 'addPlayer.exists',
        options: { playerNickname, playersNicknames },
      };
    } else if (playerInDB) {
      team.players.push(playerInDB);
      console.log(
        `Player ${playerInDB.nickname} was added to the team from the DB.`,
        new Date().toLocaleString()
      );
    } else {
      const {
        player_id,
        nickname,
        elo,
        lvl,
        kd,
        avg,
        hs,
        winrate,
        error,
        errorMessage,
      } = await getPlayerInfo({
        playerNickname,
        playersNicknames,
      });
      if (error) return errorMessage;
      const { options } = await getHighestElo(nickname);
      const player = new Player({
        _id: player_id,
        player_id,
        nickname,
        elo,
        lvl,
        kd,
        avg,
        hs,
        winrate,
        highestElo: options?.highestElo,
        highestEloDate: options?.highestEloDate,
      });
      player.save().then(async () => {
        webhookMgr.addPlayersToList([player.player_id]);
        console.log(
          `Player ${player.nickname} was added to the team from the Faceit API.`,
          new Date().toLocaleString()
        );
      });
      team.players.push(player);
    }

    team = await team.save();

    return {
      text: 'addPlayer.success',
      options: {
        nickname: playerNickname,
        teamNicknames: getTeamNicknames(team).join(', '),
      },
    };
  } catch (e) {
    console.log(e);
    return {
      text: 'serverError',
    };
  }
};
