import { readFileSync } from 'node:fs';

import { SERVER_URL } from '#config';

export const getBestMapsTemplate = (msg, bestMap) => {
  const cssContent = readFileSync('public/css/best-maps.css', 'utf-8').replace(
    '[BEST_MAP_NAME]',
    bestMap
  );

  return `<html lang="en">
  <head>
  <base href="${SERVER_URL}">
  <style>${cssContent}</style>
</head>
<body> ${msg} </body>
</html>`;
};
