import { calculateAverage } from '#utils';
import { lvlClasses, messages } from '#config';
import { Team } from '#models';

export const getTeamEloMessage = async (chat_id) => {
  const team = await Team.findOne({ chat_id });
  if (!team) return { error: true, message: messages.teamNotExistError };
  const { players } = await team.populate('players');
  const isTeamEmpty = !players || players?.length === 0;
  const statAttribute = 'Elo';

  return isTeamEmpty
    ? prepareEmptyTeamResult(statAttribute)
    : prepareProperResult(players, statAttribute);
};

function prepareEmptyTeamResult(statAttribute) {
  return {
    error: true,
    message: messages.emptyTeamError(statAttribute),
  };
}

function prepareProperResult(players, statAttribute) {
  const playersStats = players.sort((a, b) => b.elo - a.elo);
  const playerEloMessage = formatMessage(playersStats);
  const playersElo = playersStats.map(({ elo }) => elo);
  const avgTeamElo =
    playersElo.length > 1 ? calculateAverage(playersElo).toFixed(0) : null;

  return {
    error: false,
    message: messages.getTeamStats(playerEloMessage, statAttribute, avgTeamElo),
  };
}

function formatMessage(playersStats) {
  return playersStats
    .map(
      (playerStats) =>
        `<div class="player-elo-block"><span>${
          playerStats.nickname
        }:</span> <span class=${lvlClasses[playerStats.lvl]}>${
          playerStats.elo
        } elo</span></div>`
    )
    .join('');
}
