import { getSummaryStats, getTeamEloData } from '#services';
import {
  telegramSendMessage,
  telegramDeleteMessage,
  getTeamKDWrapper,
  getHighestEloWrapper,
  getPlayerLastMatchesWrapper,
  getTelegramBot,
  getBasicTelegramOptions,
  getDefaultTelegramCallbackOptions,
  sendPhoto,
  logEvent,
  actionTracking,
} from '#utils';
import { getSummaryStatsTemplate, getEloTemplate } from '#templates';
import { getStatsMarkup } from '#telegramReplyMarkup';

const tBot = getTelegramBot();
const defaultOpts = getDefaultTelegramCallbackOptions();

async function handleSummary(opts, msg) {
  const { data, error } = await getSummaryStats(opts.chat_id);
  logEvent(msg.chat, 'Get summary stats');
  actionTracking(opts.chat_id);
  error
    ? await telegramSendMessage(
        opts.chat_id,
        { text: text || error },
        getBasicTelegramOptions(opts.message_id)
      )
    : await sendPhoto([opts.chat_id], null, getSummaryStatsTemplate(data));
  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(
    opts.chat_id,
    { text: 'doneSelectOneOfTheOptions' },
    {
      ...opts,
      ...getStatsMarkup,
    }
  );
}

async function handleTeamKD(opts, msg, callbackQuery) {
  const amount = callbackQuery.data.split('?')[1];

  logEvent(msg.chat, `Get team KD last ${amount}`);
  actionTracking(opts.chat_id);

  if (amount !== 'custom') {
    getTeamKDWrapper(amount, opts);
  } else {
    telegramSendMessage(
      opts.chat_id,
      { text: 'sendLastMatchesCount' },
      {
        ...defaultOpts,
      }
    ).then(({ message_id: bot_message_id }) => {
      tBot.onReplyToMessage(opts.chat_id, bot_message_id, async ({ text: amount, message_id }) => {
        await getTeamKDWrapper(amount, opts, message_id);
        await telegramDeleteMessage(opts.chat_id, message_id);
        await telegramDeleteMessage(opts.chat_id, bot_message_id);
      });
    });
  }
}

async function handleTeamElo(opts, msg) {
  const { errorMessage, data } = await getTeamEloData(opts.chat_id);

  logEvent(msg.chat, 'Get team Elo');
  actionTracking(opts.chat_id);

  errorMessage
    ? await telegramSendMessage(
        opts.chat_id,
        { text: errorMessage },
        getBasicTelegramOptions(opts.message_id)
      )
    : await sendPhoto([opts.chat_id], null, getEloTemplate(data));
  await telegramDeleteMessage(opts.chat_id, opts.message_id);
  await telegramSendMessage(
    opts.chat_id,
    { text: 'doneSelectOneOfTheOptions' },
    {
      ...opts,
      ...getStatsMarkup,
    }
  );
}

async function handlePlayerLastMatches(opts, msg, teamNicknames, callbackQuery) {
  const nickname = callbackQuery.data.split('?')[1];
  await getPlayerLastMatchesWrapper(nickname, msg.chat, opts, teamNicknames);
}

async function handleHighestElo(opts, msg, teamNicknames, callbackQuery) {
  const nickname = callbackQuery.data.split('?')[1];

  await getHighestEloWrapper(nickname, teamNicknames, opts, msg.chat);
}

export { handleSummary, handleTeamKD, handleTeamElo, handlePlayerLastMatches, handleHighestElo };
