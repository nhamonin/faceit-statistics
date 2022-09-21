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
  const avgTeamKDMessage =
    'Avg Team K/D: ' +
    calculateAverage(
      avgPlayersKD.map((avgPlayerKD) => Object.values(avgPlayerKD)[0])
    ).toFixed(2);

  return `Last 20 matches:<br><br>${playersKDMessage}<br><br>${avgTeamKDMessage}`;
};

function getAvgPlayersKD(playersMatchesStats) {
  return playersMatchesStats.map((playerMatchesStats) => ({
    [playerMatchesStats[0].nickname]: calculateAverage(
      playerMatchesStats.map(({ player_stats }) => +player_stats['K/D Ratio'])
    ),
  }));
}

function formatMessage(avgPlayersKD) {
  return avgPlayersKD
    .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])
    .map(
      (avgPlayerKD) =>
        `${Object.keys(avgPlayerKD)[0]}: <span class='${getKDColorClass(
          +Object.values(avgPlayerKD)[0]
        )}'>${(+Object.values(avgPlayerKD)[0]).toFixed(
          2
        )} <span class='white'>&nbsp;K/D</span></span>`
    )
    .join('<br>');
}

function getKDColorClass(kdValue) {
  if (kdValue < 1) {
    return 'red';
  } else if (kdValue < 1.1) {
    return 'yellow';
  } else if (kdValue < 1.3) {
    return 'green';
  } else {
    return 'aqua';
  }
}
