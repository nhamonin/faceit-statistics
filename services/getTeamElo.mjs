import calculateAverage from '../utils/calculateAverage.mjs';
import { lvlClasses } from '../config/config.js';
import { Team } from '../models/team.js';

export const getTeamEloMessage = async (chat_id) => {
  const team = await Team.findOne({ chat_id });
  const playersStats = team.players.sort((a, b) => b.elo - a.elo);
  const playerEloMessage = formatMessage(playersStats);

  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamEloMessage =
    'Avg Team Elo: ' + calculateAverage(playersElo).toFixed(0);

  return `${playerEloMessage}<br><br>${avgTeamEloMessage}`;
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
