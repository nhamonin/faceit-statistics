import i18next from 'i18next';

import { SERVER_URL } from '#config';

export const getKDTemplate = (lastNMatches, teamStats) =>
  `<html lang="en">
        <head>
        <base href="${SERVER_URL}">
        <link rel="stylesheet" href="public/css/kd.css">
        </head>
    <body>${i18next.t(
      lastNMatches.text,
      lastNMatches.options
    )}<br><br>${i18next.t(teamStats.text, teamStats.options)}</body>
</html>`;
