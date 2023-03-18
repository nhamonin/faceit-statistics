import { getPlayerMatches, getPlayerInfo } from '#utils';
import strings from '#strings';

export const getPlayerLastMatchesStats = async (playerNickname) => {
  try {
    const { player_id } = await getPlayerInfo({ playerNickname });
    if (!player_id)
      return { error: strings.getPlayerLastMatches.notExists(playerNickname) };
    const playerMatches = await getPlayerMatches(player_id);
    const message = formatMessage(playerMatches, playerNickname);

    return { message };
  } catch (e) {
    console.log(e);
    return { error: strings.serverError };
  }
};

function formatMessage(playerMatches, playerNickname) {
  return playerMatches.length
    ? [
        `The last 20 matches played by <b>${playerNickname}</b>:\n`,
        '<code>Result Score PlayerK/D   Map',
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
      ].join('\n')
    : 'No matches found.';
}
