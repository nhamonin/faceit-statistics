import { getTeamKDMessage } from '../../services/index.js';
import { sendPhoto } from '../index.js';
import { getKDTemplate } from '../../public/templates/index.js';
import { getTeamKDMenu } from '../../config/telegramReplyMarkup/index.js';

export async function getTeamKDWrapper(tBot, amount, opts, message_id) {
  const { message, error } = await getTeamKDMessage(amount, opts.chat_id);

  if (!error) {
    await sendPhoto(
      tBot,
      opts.chat_id,
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
