import calculateAverage from '../utils/calculateAverage.mjs';
import { lvlClasses, messages } from '../config/config.js';
import { Team } from '../models/team.js';

export const getTeamEloMessage = async (chat_id) => {
  const result = {
    error: false,
    message: '',
  };
  const { players } = await Team.findOne({ chat_id });
  const noPlayersInTeam = players.length === 0;

  if (noPlayersInTeam) {
    result.error = true;
    result.message = messages.emptyTeamError('elo');

    return result;
  }

  const playersStats = players.sort((a, b) => b.elo - a.elo);
  const playerEloMessage = formatMessage(playersStats);
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamEloMessage =
    'Avg Team Elo: ' + calculateAverage(playersElo).toFixed(0);

  result.message = `${playerEloMessage}<br><br>${avgTeamEloMessage}`;
  return result;
};

function formatMessage(playersStats) {
  return playersStats
    .map(
      (playerStats) =>
        `${playerStats.nickname}: <span class='float-right'>${
          playerStats.elo
        } elo <span class=${lvlClasses[playerStats.lvl]}>(${
          playerStats.lvl.toString().length === 2
            ? playerStats.lvl
            : '&nbsp;' + playerStats.lvl + '&nbsp;'
        } lvl)</span></span>`
    )
    .join('<br>');
}
