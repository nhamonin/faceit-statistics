import { calculateAverage, getLangByChatID } from '#utils';
import { lvlClasses } from '#config';
import { Team } from '#models';

export const getTeamEloMessage = async (chat_id) => {
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, text: 'teamNotExistError' };
  const { players } = await team.populate('players');
  const lang = await getLangByChatID(chat_id);
  const statAttribute = 'ELO';

  return prepareProperResult(players, statAttribute, lang);
};

function prepareProperResult(players, statAttribute, lang) {
  const playersStats = players.sort((a, b) => b.elo - a.elo);
  const playersEloText = formatText(playersStats);
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamElo =
    playersElo.length > 1 ? calculateAverage(playersElo).toFixed(0) : null;

  return {
    error: false,
    text: avgTeamElo ? 'images.getTeamStatsWithAvg' : 'images.getTeamStats',
    options: {
      playersStatText: playersEloText,
      statAttribute,
      avgTeamStat: avgTeamElo,
      lng: lang,
    },
  };
}

function formatText(playersStats) {
  return playersStats
    .map(
      (playerStats) =>
        `<div class="player-elo-block"><span>${
          playerStats.nickname
        }:</span> <span class=${lvlClasses[playerStats.lvl]}>${
          playerStats.elo
        }&nbsp;</span></div>`
    )
    .join('');
}
