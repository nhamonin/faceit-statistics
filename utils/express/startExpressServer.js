import https from 'node:https';
import fs from 'node:fs';

import express from 'express';

import { isProduction, host, port } from '#config';
import { main, faceitWebhook, telegramWebhook } from '#routes';

export function startExpressServer() {
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
}
