import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEY } from './config/config.js';
import {
  initBotListener,
  resetTeamListener,
  addPlayerListener,
  deletePlayerListener,
  updateTeamPlayersListener,
  getTeamKDListener,
  getTeamEloListener,
  getPLayerLastMatchesStatsListener,
} from './controllers/telegramController.js';
import { connectDB } from './utils/index.js';

Faceit.setApiKey(FACEIT_API_KEY);

connectDB();
// telegram bot listeners
initBotListener();
resetTeamListener();
addPlayerListener();
deletePlayerListener();
updateTeamPlayersListener();
getTeamKDListener();
getTeamEloListener();
getPLayerLastMatchesStatsListener();
