import { SERVER_URL } from '#config';

export const getKDTemplate = ({
  avgPlayersKD,
  statAttribute,
  avgTeamStats,
  lastMatchesMessage,
  noCs2InfoMessage,
}) =>
  `<html lang="en">
    <head>
      <base href="${SERVER_URL}">
      <link rel="stylesheet" href="public/css/main.css">
      <link rel="stylesheet" href="public/css/colors.css">
      <link rel="stylesheet" href="public/css/kd.css">
    </head>
    <body>
      <div class="player-kd">
        <div class="player-kd__title">
          <img src="public/images/general/arrows.svg" alt="arrows" />
          <span>${lastMatchesMessage}</span>
        </div>
        <div class="player-kd__main">
          ${avgPlayersKD
            .map((item) => {
              if (item.value === '0.00') {
                return `
                    <div class="player-kd__player">
                      <span>${item.nickname}:</span>
                      <div class="no-info">${noCs2InfoMessage}</div>
                    </div>
                  `;
              } else {
                return `
                    <div class="player-kd__player">
                      <span>${item.nickname}:</span>
                      <span class="${item.class}">
                        ${item.value}
                        <span class="white">&nbsp;K/D</span>
                      </span>
                    </div>
                  `;
              }
            })
            .join('')}
        </div>
        ${
          avgTeamStats.value !== null
            ? `
        <div class="player-kd__summary">
          ${avgTeamStats.average}:&nbsp;<span class="${avgTeamStats.class}">${avgTeamStats.value}</span>&nbsp;${statAttribute}
        </div>`
            : ''
        }
      </div>
    </body>
</html>`;
