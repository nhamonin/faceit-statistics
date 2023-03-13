import { getTeamKDMessage } from '#services';
import { sendPhoto, telegramSendMessage, telegramDeleteMessage } from '#utils';
import { getKDTemplate } from '#templates';
import { getTeamKDMenu } from '#telegramReplyMarkup';
import strings from '#strings';

export async function getTeamKDWrapper(amount, opts, message_id) {
  const { message, error } = await getTeamKDMessage(amount, opts.chat_id);

  if (!error) {
    await sendPhoto([opts.chat_id], message_id, getKDTemplate(amount, message));
  }

  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(
    opts.chat_id,
    error ? message : strings.selectOnOfTheOptions(true),
    {
      ...opts,
      ...getTeamKDMenu,
    }
  );
}
