import { getSummaryStats, getTeamEloMessage } from '#services';
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
} from '#utils';
import { getSummaryStatsTemplate, getEloTemplate } from '#templates';
import { getStatsMarkup } from '#telegramReplyMarkup';

const tBot = getTelegramBot();
const defaultOpts = getDefaultTelegramCallbackOptions();

async function handleSummary(opts, msg) {
  const { text, error } = await getSummaryStats(opts.chat_id);
  logEvent(msg.chat, 'Get summary stats');
  error
    ? await telegramSendMessage(
        opts.chat_id,
        { text: text || error },
        getBasicTelegramOptions(opts.message_id)
      )
    : await sendPhoto([opts.chat_id], null, getSummaryStatsTemplate(text));
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

  if (amount !== 'custom') {
    getTeamKDWrapper(amount, opts);
    logEvent(msg.chat, `Get team KD last ${amount}`);
  } else {
    telegramSendMessage(
      opts.chat_id,
      { text: 'sendLastMatchesCount' },
      {
        ...defaultOpts,
      }
    ).then(({ message_id: bot_message_id }) => {
      tBot.onReplyToMessage(
        opts.chat_id,
        bot_message_id,
        async ({ text: amount, message_id }) => {
          logEvent(msg.chat, `get team KD last ${amount}`);
          await getTeamKDWrapper(amount, opts, message_id);
          await telegramDeleteMessage(opts.chat_id, message_id);
          await telegramDeleteMessage(opts.chat_id, bot_message_id);
        }
      );
    });
  }
}

async function handleTeamElo(opts, msg) {
  const { text, options, error } = await getTeamEloMessage(opts.chat_id);

  logEvent(msg.chat, 'Get team Elo');
  error
    ? await telegramSendMessage(
        opts.chat_id,
        { text: error },
        getBasicTelegramOptions(opts.message_id)
      )
    : await sendPhoto([opts.chat_id], null, getEloTemplate({ text, options }));
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

async function handlePlayerLastMatches(
  opts,
  msg,
  teamNicknames,
  callbackQuery
) {
  const nickname = callbackQuery.data.split('?')[1];

  if (nickname !== 'custom') {
    await getPlayerLastMatchesWrapper(nickname, msg.chat, opts, teamNicknames);
  } else {
    telegramSendMessage(
      opts.chat_id,
      { text: 'sendPlayerNickname' },
      {
        ...defaultOpts,
      }
    ).then(async ({ message_id: bot_message_id }) => {
      await tBot.onReplyToMessage(
        opts.chat_id,
        bot_message_id,
        async ({ text: nickname, message_id }) => {
          await getPlayerLastMatchesWrapper(
            nickname,
            msg.chat,
            opts,
            teamNicknames
          );
          await telegramDeleteMessage(opts.chat_id, message_id);
          await telegramDeleteMessage(opts.chat_id, bot_message_id);
        }
      );
    });
  }
}

async function handleHighestElo(opts, msg, teamNicknames, callbackQuery) {
  const nickname = callbackQuery.data.split('?')[1];

  await getHighestEloWrapper(nickname, teamNicknames, opts, msg.chat);
}

export {
  handleSummary,
  handleTeamKD,
  handleTeamElo,
  handlePlayerLastMatches,
  handleHighestElo,
};