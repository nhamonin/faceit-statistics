import database from '#db';
import { calculateAverage, getPlayerLastStats, getClass } from '#utils';
import { DEFAULT_MATCH_GET_LIMIT } from '#config';

export const getTeamKDMessage = async (matchLimit, chat_id) => {
  const limit = matchLimit || DEFAULT_MATCH_GET_LIMIT;
  if (matchLimit && (!Number.isInteger(+matchLimit) || +matchLimit === 0)) {
    return {
      error: true,
      text: 'getTeamKD.validationError',
    };
  }
  const team = await database.teams.readBy({ chat_id });
  if (!team) return { error: true, text: 'teamNotExistError' };
  const players = await database.players.readAllByChatId(chat_id);
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
      return Promise.all(
        players.map(({ nickname, player_id }) =>
          getPlayerLastStats(player_id, limit).then(({ kd }) => ({
            [nickname]: kd.last || 0,
          }))
        )
      );
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
