import { getPlayerLastMatchesStats } from '#services';
import { logEvent, telegramSendMessage, telegramDeleteMessage } from '#utils';
import { lastPlayerMatchesMarkup } from '#telegramReplyMarkup';

export async function getPlayerLastMatchesWrapper(
  nickname,
  chat,
  opts,
  teamNicknames
) {
  const { text, options, error } = await getPlayerLastMatchesStats(
    nickname,
    chat.id
  );
  logEvent(chat, 'Get player last matches stats');
  try {
    await telegramDeleteMessage(opts.chat_id, opts.message_id);
    await telegramSendMessage(
      opts.chat_id,
      { text, options },
      {
        parse_mode: 'html',
      }
    );
    await telegramSendMessage(
      opts.chat_id,
      { text: error ? 'selectOneOfTheOptions' : 'doneSelectOneOfTheOptions' },
      {
        ...opts,
        ...lastPlayerMatchesMarkup(teamNicknames),
      }
    );
  } catch (e) {
    console.log(e);
  }
}
