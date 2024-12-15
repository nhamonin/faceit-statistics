import { getHighestElo } from '#services';
import { logEvent, telegramSendMessage, telegramDeleteMessage, actionTracking } from '#utils';
import { getHighestEloMenu } from '#telegramReplyMarkup';

export async function getHighestEloWrapper(nickname, teamNicknames, opts, chat) {
  const { text, options } = await getHighestElo(nickname);
  logEvent(chat, `Get Highest Elo: ${nickname}`);
  actionTracking(chat.id);

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
    { text: 'doneSelectOneOfTheOptions' },
    {
      ...opts,
      ...getHighestEloMenu(teamNicknames),
    }
  );
}
