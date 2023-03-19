import { calculateAverage, getPlayerLastStats, getClass } from '#utils';
import { DEFAULT_MATCH_GET_LIMIT } from '#config';
import { Team } from '#models';

export const getTeamKDMessage = async (matchLimit, chat_id) => {
  const limit = matchLimit || DEFAULT_MATCH_GET_LIMIT;
  if (matchLimit && (!Number.isInteger(+matchLimit) || +matchLimit === 0)) {
    return {
      error: true,
      text: 'getTeamKD.validationError',
    };
  }
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, text: 'teamNotExistError' };
  const { players } = await team.populate('players');
  const statAttribute = 'K/D';

  return prepareProperResult(players, limit, statAttribute);
};

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
    text: avgTeamKD ? 'images.getTeamStatsWithAvg' : 'images.getTeamStats',
    options: {
      playersStatText: playersKDMessage,
      statAttribute,
      avgTeamStat: avgTeamKD,
    },
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
        <span class="${getClass.kd(+playerKD)}">
          ${playerKD}
          <span class='white'>&nbsp;K/D</span>
        </span>
      </div>`;
    })
    .join('');
}
