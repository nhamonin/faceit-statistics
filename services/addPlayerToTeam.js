import { isPlayerTeamMember, getPlayersStats } from '../utils/index.js';
import { Player, Team } from '../models/index.js';
import { messages } from '../config/config.js';

export const addPlayer = async (playerNickname, chat_id) => {
  try {
    const team = await Team.findOne({ chat_id });
    const { players } = await team.populate('players');
    const playerInDB = await Player.findOne({ nickname: playerNickname });

    if (isPlayerTeamMember(players, playerNickname)) {
      return messages.addPlayer.exists(playerNickname);
    } else if (playerInDB) {
      team.players.push(playerInDB);
      console.log(
        `Player ${playerInDB.nickname} was added to the team from the DB.`
      );
    } else {
      const playerStats = await getPlayersStats([playerNickname]);
      const { player_id, nickname, elo, lvl, error, errorMessage } =
        playerStats[0];
      if (error) return errorMessage;
      const player = new Player({ player_id, nickname, elo, lvl });

      team.players.push(player);
      player.save().then(() => {
        console.log(
          `Player ${player.nickname} was added to the team from the Faceit API.`
        );
      });
    }
    return team.save().then(() => messages.addPlayer.success(playerNickname));
  } catch (e) {
    console.log(e);
    return e;
  }
};
