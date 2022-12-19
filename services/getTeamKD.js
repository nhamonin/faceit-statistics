import { calculateAverage, getPlayerAvgKD } from '#utils';
import { messages, DEFAULT_MATCH_GET_LIMIT } from '#config';
import { Team } from '#models';

export const getTeamKDMessage = async (matchLimit, chat_id) => {
  const limit = matchLimit || DEFAULT_MATCH_GET_LIMIT;
  if (matchLimit && (!Number.isInteger(+matchLimit) || +matchLimit === 0)) {
    return {
      error: true,
      message: messages.getTeamKD.validationError,
    };
  }
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, message: messages.teamNotExistError };
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
  const avgPlayersKD = await getAvgPlayersKD(players, limit);
  const playersKDMessage = formatMessage(avgPlayersKD);
  const avgTeamKD =
    avgPlayersKD.length > 1
      ? calculateAverage(
          avgPlayersKD.map((avgPlayerKD) => Object.values(avgPlayerKD)[0])
        ).toFixed(2)
      : null;

  return {
    error: false,
    message: messages.getTeamStats(playersKDMessage, 'K/D', avgTeamKD),
  };
}

async function getAvgPlayersKD(players, limit = 20) {
  switch (limit) {
    case 20:
      return players.map(({ nickname, last20KD }) => ({
        [nickname]: last20KD,
      }));
    case 50:
      return players.map(({ nickname, last50KD }) => ({
        [nickname]: last50KD,
      }));
    default:
      const res = [];
      for await (const { nickname, player_id } of players) {
        const { lastKD } = await getPlayerAvgKD(player_id, [limit], true);
        res.push({ [nickname]: lastKD });
      }
      return res;
  }
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
  } else if (kdValue < 1.5) {
    return 'aqua';
  } else {
    return 'purple';
  }
}
