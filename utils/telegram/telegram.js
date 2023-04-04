import TelegramBot from 'node-telegram-bot-api';
import i18next from 'i18next';

import {
  db,
  getPlayersByChatId,
  getTeamsByPlayerId,
  webhookMgr,
  getLangByChatID,
} from '#utils';
import {
  isProduction,
  bots,
  TELEGRAM_BOT_API_TOKEN,
  ERROR_TELEGRAM_FORBIDDEN,
  TELEGRAM_ADMIN_CHAT_ID,
} from '#config';

const tBot = getTelegramBot();

export function getBasicTelegramOptions(message_id) {
  return {
    disable_notification: true,
    reply_to_message_id: message_id,
    parse_mode: 'html',
  };
}

export function getDefaultTelegramCallbackOptions() {
  return {
    disable_notification: true,
    parse_mode: 'html',
    reply_markup: { force_reply: true },
  };
}

export function getTelegramBot() {
  if (bots.telegram) return bots.telegram;

  if (isProduction) {
    bots.telegram = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {
      polling: false,
      webHook: {
        key: 'certs/private.key',
        cert: 'certs/bundle_chained.crt',
      },
    });

    bots.telegram.setWebHook(
      `https://faceit-helper.pro/telegram-webhook-${TELEGRAM_BOT_API_TOKEN}`,
      {
        max_connections: 100000,
      }
    );
  } else {
    bots.telegram = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });
  }

  return bots.telegram;
}

export async function telegramDeleteMessage(chat_id, message_id) {
  try {
    await tBot.deleteMessage(chat_id, message_id);
  } catch (e) {
    console.log(e);
  }
}

export async function telegramEditMessage(i18opts, messageOpts) {
  const { text, options } = i18opts;
  const lang = await getLangByChatID(messageOpts.chat_id);

  processI18Options(options, lang);

  try {
    await tBot.editMessageText(
      text ? i18next.t(text, { ...options, lng: lang }) : i18opts,
      translateInlineKeyboard(messageOpts, lang)
    );
  } catch (e) {
    console.log(e);
  }
}

export async function telegramSendMessage(chat_id, i18opts, messageOpts) {
  const { text, options } = i18opts;
  const lang = await getLangByChatID(chat_id);
  let res = null;

  processI18Options(options, lang);

  try {
    res = await tBot.sendMessage(
      chat_id,
      text ? i18next.t(text, { ...options, lng: lang }) : i18opts,
      translateInlineKeyboard(messageOpts, lang)
    );
  } catch (e) {
    if (e.message.startsWith(ERROR_TELEGRAM_FORBIDDEN)) {
      handleBlockedToSendMessage(chat_id);
    } else {
      console.log(e);
    }
  }

  return res;
}

export async function handleBlockedToSendMessage(chat_id) {
  const team = await db('team').where({ chat_id }).first();
  if (!team) return;
  const players = await getPlayersByChatId(chat_id);

  await db('team').where({ chat_id }).del();

  players.forEach(async (player) => {
    const teams = await getTeamsByPlayerId(player.player_id);
    if (teams.length) return;
    await db('player')
      .where({ player_id: player.player_id })
      .del()
      .then(() => {
        webhookMgr.removePlayersFromList([player.player_id]);
      });

    console.log(
      `Successfully deleted team ${team.username || team.title || team.chat_id}`
    );
  });
}

export async function isAdminChat(chat_id) {
  return chat_id === +TELEGRAM_ADMIN_CHAT_ID;
}

function translateInlineKeyboard(opts, lng) {
  if (!opts?.reply_markup?.inline_keyboard?.length) return opts;
  const translatedInlineKeyboard = opts.reply_markup.inline_keyboard.map(
    (row) =>
      row.map((button) => ({
        ...button,
        text: i18next.t(button.text, { lng }),
      }))
  );

  return {
    ...opts,
    reply_markup: {
      ...opts.reply_markup,
      inline_keyboard: translatedInlineKeyboard,
    },
  };
}

function processI18Options(options, lang) {
  for (let key in options) {
    if (options[key] instanceof Date) {
      options[key] = Intl.DateTimeFormat(lang === 'uk' ? 'ukr' : lang).format(
        options[key]
      );
    }
  }
}
