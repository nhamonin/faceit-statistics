import { calculateAverage, getPlayerLastStats } from '#utils';
import { DEFAULT_MATCH_GET_LIMIT, statsNumberArray } from '#config';
import { Team } from '#models';
import strings from '#strings';

export const getTeamKDMessage = async (matchLimit, chat_id) => {
  const limit = matchLimit || DEFAULT_MATCH_GET_LIMIT;
  if (matchLimit && (!Number.isInteger(+matchLimit) || +matchLimit === 0)) {
    return {
      error: true,
      message: strings.getTeamKD.validationError,
    };
  }
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, message: strings.teamNotExistError };
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
    message: strings.emptyTeamError(statAttribute),
  };
}

async function prepareProperResult(players, limit, statAttribute) {
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
    message: strings.getTeamStats(playersKDMessage, statAttribute, avgTeamKD),
  };
}

async function getAvgPlayersKD(players, limit = 20) {
  switch (+limit) {
    case 10:
      return players.map(({ nickname, kd }) => ({
        [nickname]: kd.last10 || 0,
      }));
    case 20:
      return players.map(({ nickname, kd }) => ({
        [nickname]: kd.last20 || 0,
      }));
    case 50:
      return players.map(({ nickname, kd }) => ({
        [nickname]: kd.last50 || 0,
      }));
    default:
      const res = [];
      for await (const { nickname, player_id } of players) {
        const { kd } = await getPlayerLastStats(player_id, limit);
        res.push({ [nickname]: kd.last || 0 });
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

      return `
      <div class="player-kd-block">
        <span>${playerNickname}</span>
        <span class="${getKDColorClass(+playerKD)}">
          ${playerKD}
          <span class='white'>&nbsp;K/D</span>
        </span>
      </div>`;
    })
    .join('');
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
