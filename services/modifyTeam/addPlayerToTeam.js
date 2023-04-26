import database from '#db';
import { getHighestElo } from '#services';
import {
  isPlayerTeamMember,
  getPlayerInfo,
  getTeamNicknames,
  storePlayerMatches,
  webhookMgr,
  withErrorHandling,
} from '#utils';
import { MAX_PLAYERS_AMOUNT } from '#config';

export const addPlayer = async (playerNickname, chat_id) =>
  withErrorHandling(
    async () => {
      const teamError = await checkTeamExists(chat_id);
      if (teamError) return teamError;

      const players = await database.players.readAllByChatId(chat_id);
      const playerInDB = await database.players.readBy({
        nickname: playerNickname,
      });

      const playerLimitError = checkPlayerLimit(players);
      if (playerLimitError) return playerLimitError;

      if (isPlayerTeamMember(players, playerNickname)) {
        const playersNicknames = getTeamNicknames(players).join(', ');
        return {
          text: 'addPlayer.exists',
          options: {
            nickname: playerNickname,
            teamNicknames: playersNicknames,
          },
        };
      } else if (playerInDB) {
        await addPlayerFromDB(playerInDB, chat_id);
      } else {
        await addPlayerFromAPI(playerNickname, players, chat_id);
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

async function addPlayerFromDB(playerInDB, chat_id) {
  await database.teamsPlayers.create({
    chat_id,
    player_id: playerInDB.player_id,
  });
  console.log(
    `Player ${playerInDB.nickname} was added to the team from the DB.`,
    new Date().toLocaleString()
  );
}

async function addPlayerFromAPI(playerNickname, players, chat_id) {
  const playerInfo = await getPlayerInfo({
    playerNickname,
    playersNicknames: getTeamNicknames(players).join(', '),
    newPlayer: true,
  });

  if (playerInfo.error) {
    return {
      text: playerInfo.errorMessage,
      options: playerInfo.errorOptions,
    };
  }

  await addNewPlayer(playerInfo, chat_id);
  await updatePlayerStats(playerInfo.player_id);
}

async function updatePlayerStats(player_id) {
  const { kd, avg, hs, winrate } = await getPlayerInfo({
    playerID: player_id,
  });

  await database.players.updateAllBy({ player_id }, { kd, avg, hs, winrate });
}

async function checkTeamExists(chat_id) {
  const team = await database.teams.readBy({ chat_id });
  if (!team) return { text: 'teamNotExistError' };
  return null;
}

function checkPlayerLimit(players) {
  if (players?.length + 1 > MAX_PLAYERS_AMOUNT) {
    return {
      text: 'addPlayer.maxPlayersAmount',
      options: { playersNicknames: getTeamNicknames(players).join(', ') },
    };
  }
  return null;
}

async function addNewPlayer(playerInfo, chat_id) {
  const { player_id, nickname, elo, lvl } = playerInfo;

  await database.players.create({
    player_id,
    nickname,
    elo,
    lvl,
    kd: 0,
    avg: 0,
    hs: 0,
    winrate: 0,
  });
  console.log(
    JSON.stringify({
      player_id,
      nickname,
      elo,
      lvl,
      kd: 0,
      avg: 0,
      hs: 0,
      winrate: 0,
    })
  );
  await database.teamsPlayers.create({
    chat_id,
    player_id,
  });
  await storePlayerMatches(player_id, chat_id);
  const { options } = await getHighestElo(nickname);
  await database.players.updateAllBy(
    { player_id },
    {
      highestElo: options.highestElo,
      highestEloDate: options.highestEloDate,
    }
  );
  await webhookMgr.addPlayersToList([player_id]);

  console.log(
    `Player ${nickname} was added to the team from the Faceit API.`,
    new Date().toLocaleString()
  );
}
