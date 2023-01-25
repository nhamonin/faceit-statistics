import { getHighestElo } from '#services';
import { logEvent } from '#utils';
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

  await tBot.deleteMessage(opts.chat_id, opts.message_id);
  await tBot.sendMessage(opts.chat_id, message || error, {
    parse_mode: 'html',
  });
  await tBot.sendMessage(
    opts.chat_id,
    'Done! Select one of the options below:',
    {
      ...opts,
      ...getHighestEloMenu(teamNicknames),
    }
  );
}
