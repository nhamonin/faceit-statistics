import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEYS } from '#config';
import { initTelegramBotListener } from '#controllers';
import { webhookListener } from '#services';
import { connectDB, adjustConsoleLog } from '#utils';

Faceit.setApiKeys(FACEIT_API_KEYS);

await connectDB();
adjustConsoleLog();
initTelegramBotListener();
webhookListener();
