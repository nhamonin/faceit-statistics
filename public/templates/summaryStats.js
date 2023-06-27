import { SERVER_URL } from '#config';

export const getSummaryStatsTemplate = (playersMarkup) =>
  `<html lang="en">
  <head>
  <base href="${SERVER_URL}">
  <link rel="stylesheet" href="public/css/summary-stats.css">
</head>
<body> ${playersMarkup} </body>
</html>`;
