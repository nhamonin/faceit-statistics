import { messages } from '../config/config.js';
import { getPlayerMatches, getPlayerInfo } from '../utils/index.js';

export const getPlayerLastMatchesStats = async (playerNickname) => {
  try {
    const { player_id } = await getPlayerInfo(playerNickname);
    if (!player_id) return { error: messages.getPlayerLastMatches.notExists(playerNickname) };
    const playerMatches = await getPlayerMatches(player_id);
    const message = formatMessage(playerMatches);

    return { message };
  } catch (e) {
    console.log(e.message);
    return { error: messages.serverError };
  }
};

function formatMessage(playerMatches) {
  return [
    '<code>Result Score PlayerK/D    Map',
    ...playerMatches.map((match) => {
      const result = match.i10 === '1' ? ' W 🟢' : ' L 🔴';
      const score = match.i18
        .split('/')
        .map((teamScore, index) => {
          const prefix = index === 0 ? ' ' : '';
          teamScore = teamScore.trim();
          return (
            prefix + (teamScore.length === 1 ? teamScore + ' ' : teamScore)
          );
        })
        .join('/');
      const playerKD =
        '  ' + (+match.c2).toFixed(2) + (match.c2 >= 1 ? ' 🟢' : ' 🔴');
      const map = ' ' + match.i1.replace('de_', '');

      return `${result} ${score}${playerKD} ${map}`;
    }),
    '</code>',
  ].join('\n');
}
