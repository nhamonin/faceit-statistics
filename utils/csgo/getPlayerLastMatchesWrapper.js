import { getPlayerLastMatchesStats } from '#services';
import { logEvent, deleteMessage } from '#utils';
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
    await deleteMessage(opts.chat_id, opts.message_id);
    await tBot.sendMessage(opts.chat_id, message || error, {
      parse_mode: 'html',
    });
    await tBot.sendMessage(
      opts.chat_id,
      'Done! Select one of the options below:',
      {
        ...opts,
        ...lastPlayerMatchesMarkup(teamNicknames),
      }
    );
  } catch (e) {
    console.log(e);
  }
}
