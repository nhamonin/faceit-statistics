import { SERVER_URL } from '#config';

export const getSummaryStatsTemplate = ({
  playersWithStatus,
  overallTitle,
  lastStatsTitle,
  noCs2InfoMessage,
}) => `
  <html lang="en">
    <head>
      <base href="${SERVER_URL}">
      <link rel="stylesheet" href="public/css/main.css">
      <link rel="stylesheet" href="public/css/colors.css">
      <link rel="stylesheet" href="public/css/summary-stats.css">
    </head>
    <body>
    ${playersWithStatus
      .map((player) => {
        if (player.elo.value === 0) {
          return `
            <div class="player-container${player.playerContainerModificator}">
              <div class="player-container__nickname ${player.eloDifferenceClass}" data-elo-difference="${player.eloDifference}">${player.nickname}</div>
              <div class="no-info">${noCs2InfoMessage}</div>
            </div>
          `;
        } else {
          return `
            <div class="player-container${player.playerContainerModificator}">
              <div class="player-container__nickname ${player.eloDifferenceClass}" data-elo-difference="${player.eloDifference}">${player.nickname}</div>
                <div
                  class="faceit-lvl"
                  data-prev-elo-distance="${player.prevEloDistance}"
                  data-next-elo-distance="${player.nextEloDistance}"
                >
                  <img
                    class="faceit-lvl__image"
                    src="public/images/faceit-levels/${player.lvl}.svg"
                    alt="faceit-${player.lvl}-lvl"
                  />
                </div>
                <div class="player-container__main-stats">
                  <div class="stats-wrapper__main-stats">
                    <div class="stats-wrapper__image"></div>
                    <div class="stats-wrapper__title">${overallTitle}</div>
                    <div class="stats-wrapper__stats">
                      <div class="stats-attribute-wrapper">
                        <div class="stats-attribute__item">Elo</div>
                        <div class="stats-attribute__item">Top</div>
                        <div class="stats-attribute__item">W/R</div>
                      </div>
                      <div class="stats-value-wrapper">
                        <div
                          class="stats-value__item ${player.elo.class}">${player.elo.value}
                        </div>
                        <div class="stats-value__item ${player.highestElo.class}">${player.highestElo.value}</div>
                        <div class="stats-value__item ${player.winrate.class} percent">${player.winrate.value}</div>
                      </div>
                    </div>
                  </div>
                </div>
              <div class="player-container__last-stats">
                <div class="stats-wrapper__last-stats">
                  <div class="stats-wrapper__image"></div>
                  <div class="stats-wrapper__title">${lastStatsTitle}</div>
                  <div class="stats-wrapper__stats">
                    <div class="stats-attribute-wrapper">
                      <div class="stats-attribute__item">K/D</div>
                      <div class="stats-attribute__item">AVG</div>
                      <div class="stats-attribute__item">HS</div>
                    </div>
                    <div class="stats-value-wrapper">
                      <div class="stats-value__item ${player.kd.class}">${player.kd.value}</div>
                      <div class="stats-value__item ${player.avg.class}">${player.avg.value}</div>
                      <div class="stats-value__item ${player.hs.class} percent">${player.hs.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      })
      .join('')}
    </body>
  </html>`;
