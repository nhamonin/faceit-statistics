import i18next from 'i18next';

import database from '#db';
import { getLangByChatID, withErrorHandling } from '#utils';

export const getPlayerLastMatchesStats = async (nickname, chat_id) =>
  withErrorHandling(
    async () => {
      const playerInDB = await getPlayerFromDB(nickname);

      if (!playerInDB) {
        return {
          text: 'playerNotExistsError',
          options: { nickname },
          error: true,
        };
      }

      const playerMatches = await getPlayerMatches(playerInDB.player_id);
      const lang = await getLangByChatID(chat_id);

      return { text: formatMessage(playerMatches, nickname, lang) };
    },
    {
      errorMessage: 'serverError',
    }
  )();

async function getPlayerFromDB(nickname) {
  return await database.players.readBy({ nickname });
}

async function getPlayerMatches(player_id) {
  return await database.matches.readAllBy(
    { player_id, game_mode: '5v5' },
    {
      limit: 20,
      excludeNull: 'elo',
    }
  );
}

function formatMessage(playerMatches, nickname, lng) {
  return playerMatches.length
    ? [
        i18next.t('playerLastMatches', { nickname, lng }),
        '<code>',
        ...playerMatches.map(formatMatch),
        '</code>',
      ].join('\n')
    : i18next.t('playerHasNoMatches', { nickname, lng });
}

function formatMatch(match) {
  const result = match.win ? ' W 🟢' : ' L 🔴';
  const score = formatScore(match.score);
  const playerKD = formatPlayerKD(match.kd);
  const map = formatMap(match.map);

  return `${result} ${score}${playerKD} ${map}`;
}

function formatScore(score) {
  return score
    .split('/')
    .map((teamScore, index) => {
      const prefix = index === 0 ? ' ' : '';
      teamScore = teamScore.trim();
      return prefix + (teamScore.length === 1 ? teamScore + ' ' : teamScore);
    })
    .join('/');
}

function formatPlayerKD(kd) {
  return `  ${kd.toFixed(2)}${kd >= 1 ? ' 🟢' : ' 🔴'}`;
}

function formatMap(map) {
  return ` ${map.replace('de_', '')}`;
}
