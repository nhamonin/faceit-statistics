import { readFileSync } from 'node:fs';

import database from '#db';
import { getClass } from '#utils';

export const getSummaryStats = async (
  chat_id,
  playedPlayers,
  playersWithResults
) => {
  const team = await database.teams.readBy({ chat_id });
  if (!team) return { text: 'teamNotExistError', error: true };
  const players = await database.players.readAllByChatId(chat_id);
  const isTeamEmpty = !players || players?.length === 0;
  const statAttribute = 'summary statistics';

  return isTeamEmpty
    ? prepareEmptyTeamResult(statAttribute)
    : prepareProperResult(team, players, playedPlayers, playersWithResults);
};

function prepareProperResult(
  team,
  players,
  playedPlayers = [],
  playersWithResults = []
) {
  const playersWithStatus = players.map((player) => {
    const playerResult = playersWithResults.find(
      (p) => p.id === player.player_id
    );
    return {
      ...player,
      active: playedPlayers.includes(player.nickname),
      win: playerResult ? playerResult.win : null,
    };
  });
  const playerSummaryStatsMarkup = formatText(team, playersWithStatus);

  return {
    error: false,
    text: playerSummaryStatsMarkup,
  };
}

function formatText(team, players) {
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
        ? ` player-container__nickname${styleSuffix}`
        : '';
      const mainStatsModificator = player.active
        ? ` player-container__main-stats${styleSuffix}`
        : '';
      const lastStatsModificator = player.active
        ? ` player-container__last-stats${styleSuffix}`
        : '';

      return `<div class="player-container">
        <div class="player-container__nickname${playerContainerModificator}">${
        player.nickname
      }</div>
        <div class="player-container__main-stats${mainStatsModificator}">
          <img
            class="faceit-lvl"
            src="data:image/svg+xml;base64,${readFileSync(
              `public/images/faceit-levels/${player.lvl}.svg`
            ).toString('base64')}"
            alt="faceit-${player.lvl}-lvl"
          />
          <div class="stats-wrapper">
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
              )} percent">${(+player.winrate.lifetime).toFixed(2)}
            </div>
          </div>
        </div>
        <div class="player-container__last-stats${lastStatsModificator}">
          <div class="stats-wrapper">
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
