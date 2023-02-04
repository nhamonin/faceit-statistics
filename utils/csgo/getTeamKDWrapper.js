import { getTeamKDMessage } from '#services';
import { sendPhoto } from '#utils';
import { getKDTemplate } from '#templates';
import { getTeamKDMenu } from '#telegramReplyMarkup';

export async function getTeamKDWrapper(tBot, amount, opts, message_id) {
  const { message, error } = await getTeamKDMessage(amount, opts.chat_id);

  if (!error) {
    await sendPhoto(
      tBot,
      [opts.chat_id],
      message_id,
      getKDTemplate(amount, message)
    );
  }

  await tBot.deleteMessage(opts.chat_id, opts.message_id);
  await tBot.sendMessage(
    opts.chat_id,
    error ? message : 'Done! Select one of the options below:',
    {
      ...opts,
      ...getTeamKDMenu,
    }
  );
}
