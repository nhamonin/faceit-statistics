import { getHighestElo } from '#services';
import { logEvent, telegramSendMessage, telegramDeleteMessage } from '#utils';
import { getHighestEloMenu } from '#telegramReplyMarkup';
import strings from '#strings';

export async function getHighestEloWrapper(
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
  await telegramSendMessage(opts.chat_id, strings.selectOnOfTheOptions(true), {
    ...opts,
    ...getHighestEloMenu(teamNicknames),
  });
}
