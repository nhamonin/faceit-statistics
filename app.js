import https from 'node:https';
import fs from 'node:fs';

import express from 'express';
import { Faceit } from 'faceit-node-api';

import { isProduction, FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import {
  connectDB,
  adjustConsoleLog,
  calculateFaceitDataAPILoad,
} from '#utils';
import { main, webhook } from '#routes';

Faceit.setApiKeys([FACEIT_API_KEY]);

calculateFaceitDataAPILoad(Faceit);
await connectDB();
adjustConsoleLog();
initTelegramBotListener();

const host = '185.166.216.70';
const port = 443;
const app = express();
app.use(express.json());
app.use(main);
app.use(webhook);

if (isProduction) {
  https
    .createServer(
      {
        key: fs.readFileSync('./certs/private.key'),
        cert: fs.readFileSync('./certs/faceit-helper_pro.crt'),
      },
      app
    )
    .listen(port, host, function () {
      console.log(`Server listens https://${host}:${port}`);
    });
} else {
  app.listen(80, () => {});
}
