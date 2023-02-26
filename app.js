import https from 'node:https';
import fs from 'node:fs';

import express from 'express';
import { Faceit } from 'faceit-node-api';

import { isProduction, host, port, FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import {
  connectDB,
  adjustConsoleLog,
  calculateFaceitDataAPILoad,
} from '#utils';
import { main, faceitWebhook, telegramWebhook } from '#routes';

Faceit.setApiKeys([FACEIT_API_KEY]);

calculateFaceitDataAPILoad(Faceit);
await connectDB();
adjustConsoleLog();
initTelegramBotListener();

const app = express();
app.use(express.json());
app.use(main);
app.use(faceitWebhook);
app.use(telegramWebhook);

if (isProduction) {
  https
    .createServer(
      {
        key: fs.readFileSync('./certs/private.key'),
        cert: fs.readFileSync('./certs/faceit-helper_pro.crt'),
        ca: [
          fs.readFileSync('./certs/faceit-helper_pro-root.crt'),
          fs.readFileSync('./certs/faceit-helper_pro-bundle.crt'),
        ],
      },
      app
    )
    .listen(port, host, function () {
      console.log(`Server listens https://${host}:${port}`);
    });
} else {
  app.listen(port, host, function () {
    console.log(`Server listens http://${host}:${port}`);
  });
}
