import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from './config/config.js';
import { initBotListener } from './controllers/telegramController.js';
import { webhookListener } from './services/index.js';
import { connectDB, adjustConsoleLog } from './utils/index.js';

Faceit.setApiKey(FACEIT_API_KEY);

connectDB();
adjustConsoleLog();
initBotListener();
webhookListener();
