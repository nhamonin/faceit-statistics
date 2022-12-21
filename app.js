import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from '#config';
import { initTelegramBotListener } from '#controllers';
import { webhookListener } from '#services';
import { connectDB, adjustConsoleLog } from '#utils';

Faceit.setApiKey(FACEIT_API_KEY);

await connectDB();
adjustConsoleLog();
initTelegramBotListener();
webhookListener();
