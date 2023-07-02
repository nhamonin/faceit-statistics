import { initTeam } from './modifyTeam/initTeam.js';
import { resetTeam } from './modifyTeam/resetTeam.js';
import { addPlayer } from './modifyTeam/addPlayerToTeam.js';
import { deletePlayer } from './modifyTeam/deletePlayerFromTeam.js';
import { updatePlayers } from './modifyTeam/updatePlayers.js';

import { getSummaryStats } from './statistics/getSummaryStats.js';
import { getTeamEloMessage } from './statistics/getTeamElo.js';
import { getTeamKDData } from './statistics/getTeamKD.js';
import { getPlayerLastMatchesStats } from './statistics/getPlayerLastMatchesStats.js';
import { getHighestElo } from './statistics/getHighestElo.js';

import { addNewPlayersToWebhookList } from './commands/addNewPlayersToWebhookList.js';
import { getAnalytics } from './commands/getAnalytics.js';
import { deleteAnalytics } from './commands/deleteAnalytics.js';

export {
  initTeam,
  resetTeam,
  addPlayer,
  deletePlayer,
  updatePlayers,
  getSummaryStats,
  getTeamEloMessage,
  getTeamKDData,
  getPlayerLastMatchesStats,
  getHighestElo,
  addNewPlayersToWebhookList,
  getAnalytics,
  deleteAnalytics,
};
