import { getTeamKDMessage } from '#services';
import {
  sendPhoto,
  telegramSendMessage,
  telegramDeleteMessage,
  getLangByChatID,
} from '#utils';
import { getKDTemplate } from '#templates';
import { getTeamKDMenu } from '#telegramReplyMarkup';

export async function getTeamKDWrapper(amount, opts, message_id) {
  const { text, options, error } = await getTeamKDMessage(amount, opts.chat_id);
  const lang = await getLangByChatID(opts.chat_id);
  const lastNMatches = {
    text: 'images.lastNMatches',
    options: {
      count: +amount,
      lng: lang,
    },
  };
  const teamStats = { text, options: { lng: lang, ...options } };

  if (!error) {
    await sendPhoto(
      [opts.chat_id],
      message_id,
      getKDTemplate(lastNMatches, teamStats)
    );
  }

  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(
    opts.chat_id,
    { text: error ? text : 'doneSelectOneOfTheOptions' },
    {
      ...opts,
      ...getTeamKDMenu,
    }
  );
}
