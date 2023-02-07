import { readFileSync } from 'node:fs';

export const getBestMapsTemplate = (msg, bestMap) =>
  `<html lang="en">
  <head>
  <style>
    @font-face {
      font-family: 'MyFontRegular';
      src: url("data:font/ttf;base64,${readFileSync(
        'public/fonts/KharkivTone.ttf'
      ).toString('base64')}");
    }
    html {
      height: 1000px;
      width: 1700px;
      color: white;
      background-image: url(data:image/jpg;base64,${readFileSync(
        `public/images/maps/${bestMap}.jpg`
      ).toString('base64')});
      background-position: center;
      background-size: 150% 150%;
      background-repeat: no-repeat;
      font-size: 2.8rem;
      font-family: 'Kharkiv Tone', sans-serif;
      font-style: normal;
      font-weight: 400;
    }
    body {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    table {
      margin-top: 7px;
      border-collapse: collapse;
      width: 1500px;
      border: 4px solid #DACEA4;
      backdrop-filter: blur(16.5px);
      border-radius: 41px;
      border-collapse: separate;
    }
    td {
      border: 1px solid #DACEA4;
    }
    th {
      background-color: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(16.5px);
      border: 1px solid #DACEA4;
      color: #000;
    }
    th:first-child {
      border-top-left-radius: 35px;
    }
    th:last-child {
      border-top-right-radius: 35px;
    }
    tr:last-child td:first-child {
      border-bottom-left-radius: 35px;
    }
    tr:last-child td:last-child {
      border-bottom-right-radius: 35px;
    }
    td, th {
      text-align: center;
      font-size: .75rem;
      line-height: 2.4;
      padding: 8px;
    }
    .green {
      background-color: rgba(9, 83, 16, 0.6);
    }
    .red {
      background-color: rgba(121, 0, 0, 0.4);
    }
  </style>
</head>
<body> ${msg} </body>
</html>`;
