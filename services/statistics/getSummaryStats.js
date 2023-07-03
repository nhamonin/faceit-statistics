import i18next from 'i18next';

import database from '#db';
import { getClass, getLangByChatID, prepareEmptyTeamResult } from '#utils';

export const getSummaryStats = async (
  chat_id,
  playedPlayers,
  playersWithResults
) => {
  const team = await database.teams.readBy({ chat_id });
  const lng = await getLangByChatID(chat_id);
  if (!team) return { errorMessage: 'teamNotExistError' };

  const players = await database.players.readAllByChatId(
    chat_id,
    [
      'player_id',
      'nickname',
      'elo',
      'highestElo',
      'winrate',
      'lvl',
      'kd',
      'avg',
      'hs',
    ],
    { column: 'elo', direction: 'desc' }
  );
  const isTeamEmpty = !players || players?.length === 0;

  return isTeamEmpty
    ? prepareEmptyTeamResult(lng)
    : getTemplateData(team, players, playedPlayers, playersWithResults, lng);
};

function getTemplateData(
  team,
  players,
  playedPlayers = [],
  playersWithResults = [],
  lng
) {
  const playersWithStatus = players.map((player) => {
    const playerResult = playersWithResults.find(
      (p) => p.id === player.player_id
    );
    const lastMatchesSetting = team?.settings?.lastMatches || 20;
    const styleSuffix = playerResult
      ? playerResult?.win
        ? '--win'
        : '--lose'
      : '';
    const playerContainerModificator = playerResult
      ? ` player-container${styleSuffix}`
      : '';

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
  });

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
    },
  };
}

function formatText(team, players, lng) {
  const lastMatchesSetting = team?.settings?.lastMatches || 20;

  return players
    .sort((a, b) => b.elo - a.elo)
    .map((player) => {
      const styleSuffix = player.active
        ? player.win
          ? '--win'
          : '--lose'
        : '';

      const playerContainerModificator = player.active
        ? ` player-container${styleSuffix}`
        : '';

      return `<div class="player-container${playerContainerModificator}">
        <div class="player-container__nickname">${player.nickname}</div>
        <img
          class="faceit-lvl"
          src="public/images/faceit-levels/${player.lvl}.svg"
          alt="faceit-${player.lvl}-lvl"
        />
        <div class="player-container__main-stats">
          <div class="stats-wrapper__main-stats">
            <div class="stats-wrapper__image"></div>
            <div class="stats-wrapper__title">${i18next.t(
              'subscriptions.summaryStats.overall',
              { lng }
            )}</div>
            <div class="stats-wrapper__stats">
              <div class="stats-attribute-wrapper">
                <div class="stats-attribute__item">Elo</div>
                <div class="stats-attribute__item">Top</div>
                <div class="stats-attribute__item">W/R</div>
              </div>
              <div class="stats-value-wrapper">
                <div class="stats-value__item ${getClass.elo(player.elo)}">${
        player.elo
      }</div>
                <div class="stats-value__item ${getClass.elo(
                  player.highestElo
                )}">${player.highestElo}</div>
                <div class="stats-value__item ${getClass.winrate(
                  player.winrate.lifetime
                )} percent">${(+player.winrate.lifetime).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="player-container__last-stats">
          <div class="stats-wrapper__last-stats">
            <div class="stats-wrapper__image"></div>
            <div class="stats-wrapper__title">${i18next.t(
              'subscriptions.summaryStats.last20',
              { lng }
            )}</div>
            <div class="stats-wrapper__stats">
              <div class="stats-attribute-wrapper">
                <div class="stats-attribute__item">K/D</div>
                <div class="stats-attribute__item">AVG</div>
                <div class="stats-attribute__item">HS</div>
              </div>
              <div class="stats-value-wrapper">
                <div class="stats-value__item ${getClass.kd(
                  player.kd[`last${lastMatchesSetting}`]
                )}">${player.kd[`last${lastMatchesSetting}`]?.toFixed(2)}</div>
                <div class="stats-value__item ${getClass.avg(
                  player.avg[`last${lastMatchesSetting}`]
                )}">${player.avg[`last${lastMatchesSetting}`]?.toFixed(1)}</div>
                <div class="stats-value__item ${getClass.hs(
                  player.hs[`last${lastMatchesSetting}`]
                )} percent">${player.hs[`last${lastMatchesSetting}`]?.toFixed(
        2
      )}</div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join('');
}
