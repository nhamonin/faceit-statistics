import getPlayersLastMatchesId from '../utils/csgo/getPlayersLastMatchesId.mjs';
import getPlayersMatchesStats from '../utils/csgo/getPlayersMatchesStats.mjs';
import calculateAverage from '../utils/calculateAverage.mjs';
import { messages } from '../config/config.js';
import { Team } from '../models/team.js';

const DEFAULT_MATCH_LIMIT = 20;

export const getTeamKdMessage = async (matchLimit, chat_id) => {
  const result = {
    error: false,
    message: '',
  };
  const limit = matchLimit || DEFAULT_MATCH_LIMIT;
  const { players } = await Team.findOne({ chat_id });
  const noPlayersInTeam = players.length === 0;

  if (noPlayersInTeam) {
    result.error = true;
    result.message = messages.emptyTeamError('K/D');

    return result;
  }

  const playersStats = players.sort((a, b) => b.elo - a.elo);
  const playersId = playersStats.map(({ player_id }) => player_id);
  const playersLastMatchesIds = await getPlayersLastMatchesId(playersId, limit);
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

  result.message = `Last ${limit} matches:<br><br>${playersKDMessage}<br><br>${avgTeamKDMessage}`;
  return result;
};

function getAvgPlayersKD(playersMatchesStats) {
  return playersMatchesStats.map((playerMatchesStats) => {
    const playerKDs = playerMatchesStats
      .filter(Boolean)
      .map(({ player_stats }) => +player_stats['K/D Ratio']);
    return { [playerMatchesStats[0].nickname]: calculateAverage(playerKDs) };
  });
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
