import { readFileSync } from 'fs';

export const getBestMapsTemplate = (msg, bestMap) =>
  `<html lang="en">
  <head>
  <style>
    html {
      height: 1000px;
      width: 1700px;
      font-weight: bold;
      color: white;
      background-image: url(data:image/jpg;base64,${readFileSync(
        `public/images/maps/${bestMap}.jpg`
      ).toString('base64')});
      background-position: center;
      background-size: 150% 150%;
      background-repeat: no-repeat;
      font-size: 4.5rem;
      font-family: Open Sans, sans-serif;
    }
    body {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    h5.teammates {
      text-align: left;
      position: absolute;
      top: 70px;
      left: 115px;
      background-color: rgba(0, 0, 0, .7);
      transform-origin: 0 0;
      transform: rotate(90deg);
      font-size: .4rem;
      opacity: 0.6;
    }
    table {
        margin-top: 70px;
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 1500px;
    }
    th {
      background-color: rgba(0, 0, 0, .7);
    }
    td, th {
        border: 1px solid white;
        text-align: center;
        font-size: .75rem;
        line-height: 1.5;
        padding: 8px;
        text-shadow: 4px 4px 4px #000;
    }
    .green {
      background-color: rgba(0, 255, 0, .3);
    }
    .red {
      background-color: rgba(255, 0, 0, .3);
    }
  </style>
</head>
<body> ${msg} </body>
</html>`;
