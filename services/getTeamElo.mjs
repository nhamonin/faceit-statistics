import { calculateAverage } from '../utils/basic.mjs';
import { lvlClasses, messages } from '../config/config.js';
import { Team } from '../models/team.js';

export const getTeamEloMessage = async (chat_id) => {
  const team = await Team.findOne({ chat_id });
  const players = team?.players;
  const isTeamEmpty = players?.length === 0;
  const statAttribute = 'Elo';

  return isTeamEmpty
    ? prepareEmptyTeamResult(statAttribute)
    : prepareProperResult(players, statAttribute);
};

function prepareEmptyTeamResult(statAttribute) {
  return {
    error: true,
    message: messages.emptyTeamError(statAttribute),
  };
}

function prepareProperResult(players, statAttribute) {
  const playersStats = players.sort((a, b) => b.elo - a.elo);
  const playerEloMessage = formatMessage(playersStats);
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamElo = calculateAverage(playersElo).toFixed(0);

  return {
    error: false,
    message: messages.getTeamStats(playerEloMessage, statAttribute, avgTeamElo),
  };
}

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
