import {
  initBot,
  initTeamStatsListener,
  initTeamEloListener,
} from './controllers/telegramController.mjs';

initBot();
initTeamStatsListener();
initTeamEloListener();
