import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import {
  adjustConsolesBehavior,
  startServer,
  initI18next,
  webhookMgr,
} from '#utils';
import { runCrons } from '#jobs';

startServer();
Promise.all([initI18next(), webhookMgr.getWebhookDataPayload()]);
Faceit.setApiKeys([FACEIT_API_KEY]);
adjustConsolesBehavior();
initTelegramBotListener();
runCrons();
