import i18next from 'i18next';

export const getKDTemplate = (lastNMatches, teamStats) =>
  `<html lang="en">
        <head>
          <style>
            html {
              width: 1000px;
              height: 600px;
              font-weight: bold;
              color: white;
              background: #0E1621;
              font-size: 4rem;
              font-family: Open Sans,sans-serif;
            }
            body {
              padding: 40px;
            }
            span {
              float: right;
            }
            .player-kd-block {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .red {
              color: #F81E00;
            }
            .yellow {
              color: #FFC803;
            }
            .green {
              color: #1DE100;
            }
            .aqua {
              color: aqua;
            }
            .purple {
              color: #9400D3;
            }
            .white {
              color: white;
            }
          </style>
        </head>
    <body>${i18next.t(
      lastNMatches.text,
      lastNMatches.options
    )}<br><br>${i18next.t(teamStats.text, teamStats.options)}</body>
</html>`;
