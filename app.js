import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import { adjustConsoleLog, startServer, initI18next, webhookMgr } from '#utils';
import { runCrons } from '#jobs';

Faceit.setApiKeys([FACEIT_API_KEY]);

adjustConsoleLog();
startServer();
initTelegramBotListener();
await initI18next();
await webhookMgr.getWebhookDataPayload();
runCrons();
