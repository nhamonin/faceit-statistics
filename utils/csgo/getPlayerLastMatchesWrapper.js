import { getPlayerLastMatchesStats } from '#services';
import { logEvent, telegramSendMessage, telegramDeleteMessage } from '#utils';
import { lastPlayerMatchesMarkup } from '#telegramReplyMarkup';
import strings from '#strings';

export async function getPlayerLastMatchesWrapper(
  nickname,
  chat,
  opts,
  teamNicknames
) {
  const { message, error } = await getPlayerLastMatchesStats(nickname);
  logEvent(chat, 'Get player last matches stats');
  try {
    await telegramDeleteMessage(opts.chat_id, opts.message_id);
    await telegramSendMessage(opts.chat_id, message || error, {
      parse_mode: 'html',
    });
    await telegramSendMessage(
      opts.chat_id,
      strings.selectOnOfTheOptions(true),
      {
        ...opts,
        ...lastPlayerMatchesMarkup(teamNicknames),
      }
    );
  } catch (e) {
    console.log(e);
  }
}
