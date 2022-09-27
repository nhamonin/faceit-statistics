import { Faceit } from 'faceit-node-api';

import {
  initBot,
  initTeamStatsListener,
  initTeamEloListener,
} from './controllers/telegramController.mjs';

Faceit.setApiKey(process.env.FACEIT_API_KEY);

initBot();
initTeamStatsListener();
initTeamEloListener();
