import { SERVER_URL } from '#config';

export const getSummaryStatsTemplate = (playersMarkup) => {
  console.log(SERVER_URL);
  console.log(`${SERVER_URL}/public/css/summary-stats.css`);

  return `<html lang="en">
  <head>
  <base href="${SERVER_URL}">
  <link rel="stylesheet" href="public/css/summary-stats.css">
</head>
<body> ${playersMarkup} </body>
</html>`;
};
