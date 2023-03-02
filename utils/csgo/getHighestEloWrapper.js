import { getHighestElo } from '#services';
import { logEvent, telegramSendMessage, telegramDeleteMessage } from '#utils';
import { getHighestEloMenu } from '#telegramReplyMarkup';

export async function getHighestEloWrapper(
  tBot,
  nickname,
  teamNicknames,
  opts,
  chat
) {
  const { message, error } = await getHighestElo(nickname);
  logEvent(chat, `Get Highest Elo: ${nickname}`);

  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(opts.chat_id, message || error, {
    parse_mode: 'html',
  });
  await telegramSendMessage(
    opts.chat_id,
    'Done! Select one of the options below:',
    {
      ...opts,
      ...getHighestEloMenu(teamNicknames),
    }
  );
}
