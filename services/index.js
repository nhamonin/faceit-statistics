import { initTeam } from './modifyTeam/initTeam.js';
import { resetTeam } from './modifyTeam/resetTeam.js';
import { addPlayer } from './modifyTeam/addPlayerToTeam.js';
import { deletePlayer } from './modifyTeam/deletePlayerFromTeam.js';
import { updateTeamPlayers } from './modifyTeam/updateTeamPlayers.js';

import { getSummaryStats } from './statistics/getSummaryStats.js';
import { getTeamEloMessage } from './statistics/getTeamElo.js';
import { getTeamKDMessage } from './statistics/getTeamKD.js';
import { getPlayerLastMatchesStats } from './statistics/getPlayerLastMatchesStats.js';
import { getHighestElo } from './statistics/getHighestElo.js';

export {
  initTeam,
  resetTeam,
  addPlayer,
  deletePlayer,
  updateTeamPlayers,
  getSummaryStats,
  getTeamEloMessage,
  getTeamKDMessage,
  getPlayerLastMatchesStats,
  getHighestElo,
};
