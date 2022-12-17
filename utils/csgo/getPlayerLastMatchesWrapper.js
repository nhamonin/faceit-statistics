import { getPlayerLastMatchesStats } from '../../services/index.js';
import { logEvent } from '../index.js';
import { lastPlayerMatchesMarkup } from '../../config/telegramReplyMarkup/index.js';

export async function getPlayerLastMatchesWrapper(
  tBot,
  callbackNickname,
  chat,
  opts,
  teamNicknames
) {
  const lastMatchesData = await getPlayerLastMatchesStats(callbackNickname);
  logEvent(chat, 'Get player last matches stats');
  await tBot.editMessageText(lastMatchesData.message, {
    ...opts,
    ...lastPlayerMatchesMarkup(teamNicknames),
  });
}
