import i18next from 'i18next';

import {
  getPlayerMatches,
  getPlayerInfo,
  getLangByChatID,
  withErrorHandling,
} from '#utils';

export const getPlayerLastMatchesStats = async (playerNickname, chat_id) =>
  withErrorHandling(
    async () => {
      const { player_id } = await getPlayerInfo({ playerNickname });
      if (!player_id)
        return {
          text: 'playerNotExistsError',
          options: { nickname: playerNickname },
          error: true,
        };
      const playerMatches = await getPlayerMatches(player_id);
      const lang = await getLangByChatID(chat_id);

      return { text: formatMessage(playerMatches, playerNickname, lang) };
    },
    {
      errorMessage: 'serverError',
    }
  )();

function formatMessage(playerMatches, nickname, lang) {
  return playerMatches.length
    ? [
        i18next.t('playerLastMatches', { nickname, lng: lang }),
        '<code>',
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
