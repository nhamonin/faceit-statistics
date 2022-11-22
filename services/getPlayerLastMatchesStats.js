import { Team } from '../models/index.js';
import { messages } from '../config/config.js';

export const getPlayerLastMatchesStats = async (chat_id, playerNickname) => {
  try {
    const team = await Team.findOne({ chat_id });
    const [player] = (await team.populate('players'))?.players.filter(
      ({ nickname }) => nickname === playerNickname
    );

    if (!player) {
      return { error: messages.getPlayerLastMatches.notExists(playerNickname) };
    }

    const playerMatches = (await player.populate('matches'))?.matches;

    const message = formatMessage(playerMatches, player.player_id);

    return { message };
  } catch (e) {
    console.log(e.message);
    return { error: messages.serverError };
  }
};

function formatMessage(playerMatches, playerID) {
  return [
    '<code>Result Score PlayerK/D    Map',
    ...playerMatches.map((match) => {
      const roundStats = match.round_stats;
      const playerTeam =
        match.teams[
          match.teams.findIndex((team) =>
            team.players.some(({ player_id }) => player_id === playerID)
          )
        ];
      if (!playerTeam) return;
      const result =
        roundStats.Winner === playerTeam.team_id ? ' W 🟢' : ' L 🔴';
      const score = roundStats.Score.split('/')
        .map((teamScore, index) => {
          const prefix = index === 0 ? ' ' : '';
          teamScore = teamScore.trim();
          return (
            prefix + (teamScore.length === 1 ? teamScore + ' ' : teamScore)
          );
        })
        .join('/');
      const { player_stats } = playerTeam.players.find(
        ({ player_id }) => player_id === playerID
      );
      const playerKD =
        '  ' +
        (+player_stats['K/D Ratio']).toFixed(2) +
        (player_stats['K/D Ratio'] >= 1 ? ' 🟢' : ' 🔴');
      const map = ' ' + roundStats.Map.replace('de_', '');

      return `${result} ${score}${playerKD} ${map}`;
    }),
    '</code>',
  ]
    .filter(Boolean)
    .join('\n');
}
