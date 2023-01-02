import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY_1, FACEIT_API_KEY_2, FACEIT_API_KEY_3 } from '#config';
import { initTelegramBotListener } from '#controllers';
import { webhookListener } from '#services';
import { connectDB, adjustConsoleLog } from '#utils';

Faceit.setApiKeys([FACEIT_API_KEY_1, FACEIT_API_KEY_2, FACEIT_API_KEY_3]);

await connectDB();
adjustConsoleLog();
initTelegramBotListener();
webhookListener();
