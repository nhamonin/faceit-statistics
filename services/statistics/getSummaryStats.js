import { readFileSync } from 'node:fs';

import { Team } from '#models';
import { getClass } from '#utils';
import strings from '#strings';

export const getSummaryStats = async (chat_id) => {
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, message: strings.teamNotExistError };
  const { players } = await team.populate('players');
  const isTeamEmpty = !players || players?.length === 0;
  const statAttribute = 'summary statistics';

  return isTeamEmpty
    ? prepareEmptyTeamResult(statAttribute)
    : prepareProperResult(team, players);
};

function prepareEmptyTeamResult(statAttribute) {
  return {
    error: true,
    message: strings.emptyTeamError(statAttribute),
  };
}

function prepareProperResult(team, players) {
  const playerSummaryStatsMarkup = formatMessage(team, players);

  return {
    error: false,
    message: playerSummaryStatsMarkup,
  };
}

function formatMessage(team, players) {
  const lastMatchesSetting = team?.settings?.lastMatches || 20;

  return players
    .sort((a, b) => b.elo - a.elo)
    .map(
      (player) =>
        `<div class="player-container">
        <div class="player-container__nickname">${player.nickname}</div>
        <div class="player-container__main-stats">
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
              )}">${player.winrate.lifetime}</div>
            </div>
          </div>
        </div>
        <div class="player-container__last-stats">
          <div class="stats-wrapper">
            <div class="stats-attribute-wrapper">
              <div class="stats-attribute__item">K/D</div>
              <div class="stats-attribute__item">AVG</div>
              <div class="stats-attribute__item">HS</div>
            </div>
            <div class="stats-value-wrapper">
              <div class="stats-value__item ${getClass.kd(
                player.kd[`last${lastMatchesSetting}`]
              )}">${player.kd[`last${lastMatchesSetting}`]}</div>
              <div class="stats-value__item ${getClass.avg(
                player.avg[`last${lastMatchesSetting}`]
              )}">${player.avg[`last${lastMatchesSetting}`]}</div>
              <div class="stats-value__item ${getClass.hs(
                player.hs[`last${lastMatchesSetting}`]
              )}">${player.hs[`last${lastMatchesSetting}`]}</div>
            </div>
          </div>
        </div>
      </div>`
    )
    .join('');
}