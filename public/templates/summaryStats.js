export const getSummaryStatsTemplate = (playersMarkup, playersAmount) =>
  `<html lang="en">
  <head>
  <style>
    html {
        background-color: rgb(16, 22, 34);
        font-family: Kharkiv Tone;
        border-bottom: ${
          playersAmount > 1 ? '50' : '0'
        }px solid rgb(16, 22, 34);
        padding: 30px;
        width: 920px;
        ${playersAmount === 1 ? 'height: 300px;' : ''}
    }

    .player-container {
        display: flex;
        flex-direction: column;
        width: 900px;
        height: 225px;
        margin-bottom: 10px;
    }

    .player-container__nickname {
        display: inline;
        box-shadow: inset 0 60px 4px -4px rgb(16 22 34);
        height: 15px;
        line-height: 24px;
        width: max-content;
        padding: 13px 40px;
        border: 1px solid #4f4f4f;
        border-bottom: 0;
        border-radius: 15px 15px 0px 0px;
        color: #fff;
        font-size: 32px;
        font-weight: 400;
        letter-spacing: 0em;
        text-align: left;
        margin-left: 60px;
    }
    .player-container__main-stats,
    .player-container__last-stats {
        width: 100%;
        height: 84px;
        border: 2px solid #fff;
        border-radius: 30px;
        margin-top: 3px;
    }

    .player-container__main-stats--played,
    .player-container__last-stats--played {
        border-color: #00ff00;
    }

    .player-container__last-stats {
        box-shadow: 0px 4px 60px 0px rgba(255, 255, 255, 0.2);
    }

    .player-container__last-stats--played {
        box-shadow: 0px 4px 60px 0px rgba(0, 255, 0, 0.2);
    }

    .faceit-lvl {
        position: relative;
        margin: 40px 0 0 60px;
        z-index: 1;
    }

    .stats-wrapper {
        display: flex;
        position: relative;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        margin: 0 60px;
        margin-top: -89px;
        color: #fff;
        width: 540px;
        margin-left: 250px;
        height: 85px;
    }

    .player-container__main-stats .stats-wrapper {
        margin-top: -144px;
    }

    .player-container__last-stats .stats-wrapper {
        margin-top: -4px;
    }

    .player-container__main-stats .stats-attribute-wrapper,
    .player-container__main-stats .stats-value-wrapper,
    .player-container__last-stats .stats-value-wrapper  {
        margin-top: 4px;
    }

    .stats-attribute-wrapper,
    .stats-value-wrapper {
        width: 100%;
        display: flex;
        align-items: top;
        justify-content: space-between;
    }

    .stats-value-wrapper {
        width: 107%;
        background-color: #2e3541;
        margin-bottom: -3px;
        border-radius: 10px 10px 0px 0px;
        padding: 6px 40px 0px;
    }

    .stats-attribute__item {
        font-size: 16px;
        background: rgba(33, 52, 90, 1);
        padding: 2px 40px;
        text-align: center;
        border-radius: 0px 0px 10px 10px;
        min-width: 55px;
        font-family: Roboto, Kharkiv Tone, sans-serif;
        font-weight: 900 !important;
    }

    .stats-value__item {
        font-family: Roboto, Kharkiv Tone, sans-serif;
        font-weight: 900 !important;
        text-align: center;
        line-height: 43px;
        font-size: 60px;
        font-weight: 400;
        min-width: 167px;
        margin-top: 2px;
    }

    .percent::after {
        content: '%';
        font-size: 0.5em;
        margin-left: 5px;
        position: absolute;
        color: white;
    }

    .red {
        color: #F81E00;
    }
    .yellow {
        color: #FFC803;
    }
    .orange {
        color: #FFA500;
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
<body> ${playersMarkup} </body>
</html>`;
