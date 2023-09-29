import i18next from 'i18next';

import database from '#db';
import { calculateAverage, getLangByChatID } from '#utils';
import { lvlClasses } from '#config';

export const getTeamEloData = async (chat_id) => {
  const team = await database.teams.readBy({ chat_id });
  if (!team) return { errorMessage: 'teamNotExistError' };
  let playersStats = await database.players.readAllByChatId(chat_id, ['nickname', 'elo', 'lvl'], {
    column: 'elo',
    direction: 'desc',
  });
  playersStats = playersStats.map((player) => ({
    ...player,
    class: lvlClasses[player.lvl],
  }));
  const lng = await getLangByChatID(chat_id);
  const statAttribute = 'ELO';

  return getTemplateData(playersStats, statAttribute, lng);
};

function getTemplateData(playersStats, statAttribute, lng) {
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamElo = playersElo.length > 1 ? calculateAverage(playersElo).toFixed(0) : null;

  return {
    data: {
      playersStats,
      avgTeamStats: {
        average: i18next.t('images.teamAverage', { lng }),
        value: avgTeamElo,
        statAttribute,
      },
      noCs2InfoMessage: i18next.t('noCs2Info', { lng }),
    },
  };
}
