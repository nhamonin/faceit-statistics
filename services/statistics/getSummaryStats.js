import i18next from 'i18next';

import database from '#db';
import { distanceToLevels, getClass, getLangByChatID, prepareEmptyTeamResult } from '#utils';
import { isProduction } from '#config';

export const getSummaryStats = async (chat_id, playedPlayers, playersWithResults) => {
  const team = await database.teams.readBy({ chat_id });
  const lng = await getLangByChatID(chat_id);
  if (!team) return { errorMessage: 'teamNotExistError' };

  const players = await database.players.readAllByChatId(
    chat_id,
    ['player_id', 'nickname', 'elo', 'highestElo', 'winrate', 'lvl', 'kd', 'avg', 'hs'],
    { column: 'elo', direction: 'desc' }
  );

  const isTeamEmpty = !players || players?.length === 0;

  return isTeamEmpty
    ? prepareEmptyTeamResult(lng)
    : getTemplateData(team, players, playedPlayers, playersWithResults, lng);
};

async function getTemplateData(team, players, playedPlayers = [], playersWithResults = [], lng) {
  const playersWithStatus = await Promise.all(
    players.map(async (player) => {
      const playerResult = playersWithResults.find((p) => p.id === player.player_id);
      const lastMatchesSetting = team?.settings?.lastMatches || 20;
      const styleSuffix = playerResult ? (playerResult?.win ? '--win' : '--lose') : '';
      const playerContainerModificator = playerResult ? ` player-container${styleSuffix}` : '';
      let eloDifferenceValue;

      if (playerResult) {
        const TEN_MINUTES_IN_MILLISECONDS = 10 * 60 * 1000;
        const matches = await database.matches.readLastByPlayerID(player.player_id, 2);
        const lastMatch = matches.length > 1 ? matches[0] : null;
        const preLastMatch = matches.length > 1 ? matches[1] : null;

        if (lastMatch && new Date() - new Date(lastMatch.timestamp) < TEN_MINUTES_IN_MILLISECONDS) {
          eloDifferenceValue = playerResult ? lastMatch.elo - preLastMatch.elo : 0;
        }
      }

      const eloDifferencePrefix = eloDifferenceValue > 0 ? '+' : '';
      const eloDifference = eloDifferencePrefix + eloDifferenceValue;
      const eloDifferenceClass = eloDifferenceValue
        ? `elo-difference elo-difference--${eloDifferenceValue > 0 ? 'win' : 'lose'}`
        : '';
      const eloDistance = distanceToLevels(player.elo);

      return {
        nickname: player.nickname,
        active: playedPlayers.includes(player.nickname),
        win: playerResult ? playerResult.win : null,
        lastMatchesSetting,
        playerContainerModificator,
        elo: {
          value: player.elo,
          class: getClass.elo(player.elo),
        },
        highestElo: {
          value: player.highestElo,
          class: getClass.elo(player.highestElo),
        },
        eloDifference,
        eloDifferenceClass,
        ...eloDistance,
        winrate: {
          value: (+player.winrate.lifetime).toFixed(2),
          class: getClass.winrate(player.winrate.lifetime),
        },
        kd: {
          value: player.kd[`last${lastMatchesSetting}`]?.toFixed(2),
          class: getClass.kd(player.kd[`last${lastMatchesSetting}`]),
        },
        avg: {
          value: player.avg[`last${lastMatchesSetting}`]?.toFixed(1),
          class: getClass.avg(player.avg[`last${lastMatchesSetting}`]),
        },
        hs: {
          value: player.hs[`last${lastMatchesSetting}`]?.toFixed(2),
          class: getClass.hs(player.hs[`last${lastMatchesSetting}`]),
        },
        lvl: player.lvl,
      };
    })
  );

  return {
    data: {
      playersWithStatus,
      overallTitle: i18next.t('subscriptions.summaryStats.overall', { lng }),
      lastStatsTitle: i18next.t('subscriptions.summaryStats.last20', { lng }),
      statAttribute: i18next.t('summaryStatistics', { lng }),
      lastMatchesMessage: i18next.t('images.lastNMatches', {
        count: playersWithStatus.length,
        lng,
      }),
      noCs2InfoMessage: i18next.t('noCs2Info', { lng }),
    },
  };
}
