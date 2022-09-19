import getPlayersLastMatchesId from '../utils/getPlayersLastMatchesId.mjs';
import getPlayersStats from '../utils/getPlayersStats.mjs';
import getPlayersMatchesStats from '../utils/getPlayersMatchesStats.mjs';
import { playersNicknames } from '../config/config.js';
import calculateAverage from '../utils/calculateAverage.mjs';

export const getTeamKdMessage = async () => {
  const playersStats = await getPlayersStats(playersNicknames);
  const playersId = playersStats.map(({ playerId }) => playerId);
  const playersLastMatchesIds = await getPlayersLastMatchesId(playersId);
  const playersMatchesStats = await getPlayersMatchesStats(
    playersLastMatchesIds
  );
  const avgPlayersKD = getAvgPlayersKD(playersMatchesStats);
  const playersKDMessage = formatMessage(avgPlayersKD);
  const avgTeamKDMessage = 'Avg Team K/D: ' + calculateAverage(avgPlayersKD);

  return `${playersKDMessage}\n\n${avgTeamKDMessage}`;
};

function getAvgPlayersKD(playersMatchesStats) {
  return playersMatchesStats.map((playerMatchesStats) =>
    calculateAverage(
      playerMatchesStats.map(({ player_stats }) => +player_stats['K/D Ratio'])
    )
  );
}

function formatMessage(avgPlayersKD) {
  return avgPlayersKD
    .map(
      (avgPlayerKD, index) =>
        `${playersNicknames[index]}: ${avgPlayerKD.toFixed(2)} K/D`
    )
    .join('\n');
}
