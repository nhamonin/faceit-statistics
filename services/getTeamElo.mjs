import getPlayersStats from '../utils/getPlayersStats.mjs';
import calculateAverage from '../utils/calculateAverage.mjs';
import { playersNicknames, lvlClasses } from '../config/config.js';

export const getTeamEloMessage = async () => {
  const playersStats = await getPlayersStats(playersNicknames);
  const playerEloMessage = formatMessage(playersStats);
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamEloMessage = 'Avg Team Elo: ' + calculateAverage(playersElo);

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
