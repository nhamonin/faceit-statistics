import {
  calculateAverage,
  extractPlayerStatsFromMatches,
} from '../utils/index.js';
import { messages, DEFAULT_MATCH_GET_LIMIT } from '../config/config.js';
import { Team } from '../models/index.js';

export const getTeamKDMessage = async (matchLimit, chat_id) => {
  const limit = matchLimit || DEFAULT_MATCH_GET_LIMIT;
  const team = await Team.findOne({ chat_id });
  const { players } = await team.populate('players');
  const isTeamEmpty = players.length === 0;
  const statAttribute = 'K/D';

  return isTeamEmpty
    ? prepareEmptyTeamResult(statAttribute)
    : prepareProperResult(players, limit, statAttribute);
};

function prepareEmptyTeamResult(statAttribute) {
  return {
    error: true,
    message: messages.emptyTeamError(statAttribute),
  };
}

async function prepareProperResult(players, limit) {
  const lastPlayersMatches = await Promise.all(
    players.map((player) =>
      player
        .populate({ path: 'matches', options: { limit } })
        .then(({ matches }) => matches)
    )
  );
  const playersMatchesStats = extractPlayerStatsFromMatches(
    players,
    lastPlayersMatches
  ).filter((arr) => !!arr.length);

  if (!playersMatchesStats.length) {
    return {
      error: true,
      message: messages.emptyMatchesError,
    };
  }

  const avgPlayersKD = getAvgPlayersKD(players, playersMatchesStats);
  const playersKDMessage = formatMessage(avgPlayersKD);
  const avgTeamKD = calculateAverage(
    avgPlayersKD.map((avgPlayerKD) => Object.values(avgPlayerKD)[0])
  ).toFixed(2);

  return {
    error: false,
    message: messages.getTeamStats(playersKDMessage, 'K/D', avgTeamKD),
  };
}

function getAvgPlayersKD(players, playersMatchesStats) {
  return playersMatchesStats.map((playerMatchesStats, index) => {
    const playerKDs = playerMatchesStats
      .filter(Boolean)
      .map(({ player_stats }) => +player_stats['K/D Ratio']);
    return { [players[index].nickname]: calculateAverage(playerKDs) };
  });
}

function formatMessage(avgPlayersKD) {
  return avgPlayersKD
    .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])
    .map((avgPlayerKD) => {
      const playerNickname = Object.keys(avgPlayerKD)[0];
      const playerKD = Object.values(avgPlayerKD)[0].toFixed(2);

      return `${playerNickname}: <span class='${getKDColorClass(
        +playerKD
      )}'>${playerKD} <span class='white'>&nbsp;K/D</span></span>`;
    })
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
