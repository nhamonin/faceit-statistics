import { Player, Team } from '../models/index.js';

export const getPlayerLastMatchesStats = async (chat_id, playerNickname) => {
  const team = await Team.findOne({ chat_id });
  const [player] = (await team.populate('players'))?.players.filter(
    ({ nickname }) => nickname === playerNickname
  );
  const playerMatches = await player
    .populate('matches')
    .then(({ matches }) => matches);

  const message = formatMessage(playerMatches);

  return { message };
};

function formatMessage(playerMatches) {
  return playerMatches
    .map(
      (match, index) =>
        `${++index}: ${match.round_stats.Map.replace('de_', '')} - ${
          match.round_stats.Score
        }`
    )
    .join('\n');
}
