import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import {
  connectDB,
  adjustConsoleLog,
  startExpressServer,
  initI18next,
} from '#utils';

Faceit.setApiKeys([FACEIT_API_KEY]);

await connectDB();
initTelegramBotListener();
adjustConsoleLog();

startExpressServer();
await initI18next();
