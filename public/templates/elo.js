import i18next from 'i18next';

import { SERVER_URL } from '#config';

export const getEloTemplate = (teamStats) =>
  `<html lang="en">
        <head>
        <base href="${SERVER_URL}">
        <link rel="stylesheet" href="public/css/elo.css">
        </head>
    <body>${i18next.t(teamStats.text, teamStats.options)}</body>
</html>`;
