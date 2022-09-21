import {
  tBotInit,
  initTeamStatsListener,
  initTeamEloListener,
} from './controllers/telegramController.mjs';

tBotInit();
initTeamStatsListener();
initTeamEloListener();
