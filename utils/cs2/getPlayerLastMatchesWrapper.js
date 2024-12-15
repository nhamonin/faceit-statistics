import { getPlayerLastMatchesStats } from '#services';
import {
  logEvent,
  telegramSendMessage,
  telegramDeleteMessage,
  withErrorHandling,
  actionTracking,
} from '#utils';
import { lastPlayerMatchesMarkup } from '#telegramReplyMarkup';

export async function getPlayerLastMatchesWrapper(nickname, chat, opts, teamNicknames) {
  const { text, options, error } = await getPlayerLastMatchesStats(nickname, chat.id);
  logEvent(chat, `Get player ${nickname} last matches stats`);
  actionTracking(chat.id);

  withErrorHandling(async () => {
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
  })();
}
