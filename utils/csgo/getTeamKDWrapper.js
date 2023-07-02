import { getTeamKDData } from '#services';
import {
  sendPhoto,
  telegramSendMessage,
  telegramDeleteMessage,
  getLangByChatID,
} from '#utils';
import { getKDTemplate } from '#templates';
import { getTeamKDMenu } from '#telegramReplyMarkup';

export async function getTeamKDWrapper(amount, opts, message_id) {
  const { errorMessage, data } = await getTeamKDData(amount, opts.chat_id);

  if (!errorMessage) {
    await sendPhoto([opts.chat_id], message_id, getKDTemplate(data));
  }

  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(
    opts.chat_id,
    { text: errorMessage || 'doneSelectOneOfTheOptions' },
    {
      ...opts,
      ...getTeamKDMenu,
    }
  );
}
