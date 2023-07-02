import { SERVER_URL } from '#config';

export const getEloTemplate = ({ avgTeamStats, playersStats }) =>
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
                  .map(
                    (item) => `
                    <div class="player-elo__player">
                        <span>${item.nickname}:</span>
                        <span class="${item.class}">${item.elo}</span>
                    </div>
                `
                  )
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
