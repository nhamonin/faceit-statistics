import { getPlayerLastMatchesStats } from '#services';
import { logEvent } from '#utils';
import { lastPlayerMatchesMarkup } from '#telegramReplyMarkup';

export async function getPlayerLastMatchesWrapper(
  tBot,
  nickname,
  chat,
  opts,
  teamNicknames
) {
  const { message, error } = await getPlayerLastMatchesStats(nickname);
  logEvent(chat, 'Get player last matches stats');
  try {
    await tBot.editMessageText(message || error, {
      ...opts,
      ...lastPlayerMatchesMarkup(teamNicknames),
    });
  } catch (e) {}
}
