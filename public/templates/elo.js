import { SERVER_URL } from '#config';

export const getEloTemplate = ({ avgTeamStats, playersStats, noCs2InfoMessage }) =>
  `<html lang="en">
        <head>
        <base href="${SERVER_URL}">
        <link rel="stylesheet" href="public/css/main.css">
        <link rel="stylesheet" href="public/css/elo.css">
        </head>
    <body>
        <div class="player-elo">
            <div class="player-elo__main">
                ${playersStats
                  .map((item) => {
                    if (item.elo === 0) {
                      return `
                          <div class="player-elo__player">
                              <span>${item.nickname}:</span>
                              <div class="no-info">${noCs2InfoMessage}</div>
                          </div>
                        `;
                    } else {
                      return `
                          <div class="player-elo__player">
                              <span>${item.nickname}:</span>
                              <div class="player-elo__right-wrapper">
                                  <span class="elo-value">${item.elo}</span>
                                  <div class="level-image ${item.class}"></div>
                              </div>
                          </div>
                        `;
                    }
                  })
                  .join('')}
            </div>
            ${
              avgTeamStats.value !== null
                ? `
            <div class="player-elo__summary">
                ${avgTeamStats.average}:&nbsp;<span class="${avgTeamStats.class}">${avgTeamStats.value}&nbsp;${avgTeamStats.statAttribute}</span>
            </div>`
                : ''
            }
        </div>
    </body>
</html>`;
