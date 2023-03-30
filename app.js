import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import { adjustConsoleLog, startExpressServer, initI18next } from '#utils';
import { runCrons } from '#jobs';

Faceit.setApiKeys([FACEIT_API_KEY]);

initTelegramBotListener();
adjustConsoleLog();

startExpressServer();
runCrons();
await initI18next();
