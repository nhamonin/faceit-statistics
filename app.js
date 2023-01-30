import express from 'express';
import { Faceit, Matches } from 'faceit-node-api';

import { FACEIT_API_KEYS } from '#config';
import { initTelegramBotListener } from '#controllers';
import {
  connectDB,
  adjustConsoleLog,
  calculateFaceitDataAPILoad,
  getPlayerInfo,
  getPlayerMatches,
  webhookMgr,
} from '#utils';
import { main, webhook } from '#routes';

Faceit.setApiKeys(FACEIT_API_KEYS);

calculateFaceitDataAPILoad(Faceit);
await connectDB();
adjustConsoleLog();
initTelegramBotListener();

const app = express();
app.use(express.json());

app.use(main);
app.use(webhook);

app.listen(80, () => {});

const playersNicknames = [
  'rallen',
  'NEXA',
  'tabseN',
  'Mir',
  'Calyx',
  '-jR-',
  'nealan',
];

for await (const playerNickname of playersNicknames) {
  const { player_id } = await getPlayerInfo({
    playerNickname,
  });
  const matchIDs = (await getPlayerMatches(player_id, 1000)).map(
    ({ matchId }) => matchId
  );
  const matches = new Matches();

  for await (const matchID of matchIDs) {
    const details = await matches.getMatchDetails(matchID);
    if (!details?.teams?.faction1?.roster?.length) continue;
    const playersIDs1 = details.teams.faction1.roster.map(
      ({ player_id }) => player_id
    );
    const playersIDs2 = details.teams.faction2.roster.map(
      ({ player_id }) => player_id
    );

    await webhookMgr.addPlayersToList(playersIDs1);
    await webhookMgr.addPlayersToList(playersIDs2);
  }

  console.log('done', playerNickname);
}