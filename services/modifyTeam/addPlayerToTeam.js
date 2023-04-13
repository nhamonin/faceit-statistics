import database from '#db';
import {
  isPlayerTeamMember,
  getPlayerInfo,
  getTeamNicknames,
  webhookMgr,
  withErrorHandling,
} from '#utils';
import { MAX_PLAYERS_AMOUNT } from '#config';
import { getHighestElo } from '#services';

export const addPlayer = async (playerNickname, chat_id) =>
  withErrorHandling(
    async () => {
      let team = await database.teams.readBy({ chat_id });
      if (!team) return { text: 'teamNotExistError' };
      const players = await database.players.readAllByChatId(chat_id);
      const playerInDB = await database.players.readBy({
        nickname: playerNickname,
      });
      const playersNicknames = getTeamNicknames(players).join(', ');
      if (players?.length + 1 > MAX_PLAYERS_AMOUNT)
        return {
          text: 'addPlayer.maxPlayersAmount',
          options: { playersNicknames },
        };

      if (isPlayerTeamMember(players, playerNickname)) {
        return {
          text: 'addPlayer.exists',
          options: {
            nickname: playerNickname,
            teamNicknames: playersNicknames,
          },
        };
      } else if (playerInDB) {
        await database.teamsPlayers.create({
          chat_id,
          player_id: playerInDB.player_id,
        });
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
          errorOptions,
        } = await getPlayerInfo({
          playerNickname,
          playersNicknames,
        });
        if (error)
          return {
            text: errorMessage,
            options: errorOptions,
          };
        const { options } = await getHighestElo(nickname, chat_id);
        const player = {
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
        };

        await database.players.create(player);

        webhookMgr.addPlayersToList([player.player_id]);
        console.log(
          `Player ${player.nickname} was added to the team from the Faceit API.`,
          new Date().toLocaleString()
        );

        await database.teamsPlayers.create({
          chat_id,
          player_id: player.player_id,
        });
      }
      const updatedPlayers = await database.players.readAllByChatId(chat_id);

      return {
        text: 'addPlayer.success',
        options: {
          nickname: playerNickname,
          teamNicknames: getTeamNicknames(updatedPlayers).join(', '),
        },
      };
    },
    {
      errorMessage: 'serverError',
    }
  )();
