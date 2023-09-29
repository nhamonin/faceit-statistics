import i18next from 'i18next';

import database from '#db';
import { calculateAverage, getPlayerLastStats, getClass, getLangByChatID } from '#utils';
import { DEFAULT_MATCH_GET_LIMIT } from '#config';

export const getTeamKDData = async (matchLimit, chat_id) => {
  const limit = matchLimit !== undefined ? Number(matchLimit) : DEFAULT_MATCH_GET_LIMIT;

  if (matchLimit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    return {
      errorMessage: 'getTeamKD.validationError',
    };
  }

  const team = await database.teams.readBy({ chat_id });
  if (!team) return { errorMessage: 'teamNotExistError' };

  const players = await database.players.readAllByChatId(chat_id);
  const statAttribute = 'K/D';
  const lng = await getLangByChatID(chat_id);

  return getTemplateData(players, limit, statAttribute, lng);
};

async function getTemplateData(players, limit, statAttribute, lng) {
  const avgPlayersKD = await getAvgPlayersKD(players, limit);
  const existedAvgPlayersKD = avgPlayersKD.filter((avgPlayerKD) => avgPlayerKD.value > 0);
  const avgTeamKD =
    existedAvgPlayersKD.length > 1
      ? calculateAverage(avgPlayersKD.map((avgPlayerKD) => +avgPlayerKD.value)).toFixed(2)
      : null;

  return {
    data: {
      avgPlayersKD,
      statAttribute,
      avgTeamStats: {
        average: i18next.t('images.teamAverage', { lng }),
        value: avgTeamKD,
        class: getClass.kd(+avgTeamKD),
      },
      lastMatchesMessage: i18next.t('images.lastNMatches', {
        count: limit,
        lng,
      }),
      noCs2InfoMessage: i18next.t('noCs2Info', { lng }),
    },
  };
}

async function getAvgPlayersKD(players, limit = 20) {
  let data;

  const field = `last${limit}`;
  if (['last10', 'last20', 'last50'].includes(field)) {
    data = players.map(({ nickname, kd }) => {
      const value = kd[field] || 0;
      return {
        nickname,
        value: value.toFixed(2),
        class: getClass.kd(value),
      };
    });
  } else {
    data = await Promise.all(
      players.map(({ nickname, player_id }) =>
        getPlayerLastStats(player_id, limit).then(({ kd }) => {
          const value = kd.last || 0;
          return {
            nickname,
            value: value.toFixed(2),
            class: getClass.kd(value),
          };
        })
      )
    );
  }

  return data.sort((a, b) => b.value - a.value);
}
