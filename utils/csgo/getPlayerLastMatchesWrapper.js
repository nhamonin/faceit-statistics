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
  const { message, error } = await getPlayerLastMatchesStats(callbackNickname);
  logEvent(chat, 'Get player last matches stats');
  try {
    await tBot.editMessageText(message || error, {
      ...opts,
      ...lastPlayerMatchesMarkup(teamNicknames),
    });
  } catch (e) {}
}
