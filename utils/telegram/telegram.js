import TelegramBot from 'node-telegram-bot-api';
import i18next from 'i18next';

import { Team, Player } from '#models';
import { webhookMgr, getLangByChatID } from '#utils';
import {
  isProduction,
  bots,
  TELEGRAM_BOT_API_TOKEN,
  ERROR_TELEGRAM_FORBIDDEN,
} from '#config';

const tBot = getTelegramBot();

export function getBasicTelegramOptions(message_id) {
  return {
    disable_notification: true,
    reply_to_message_id: message_id,
    parse_mode: 'html',
  };
}

export function getCallbackTelegramOptions() {
  return {
    disable_notification: true,
    parse_mode: 'html',
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

export async function telegramEditMessage(i18opts, opts) {
  const { text, options } = i18opts;
  const lang = await getLangByChatID(opts.chat_id);

  processI18Options(options, lang);

  try {
    await tBot.editMessageText(
      text ? i18next.t(text, { ...options, lng: lang }) : i18opts,
      translateInlineKeyboard(opts, lang)
    );
  } catch (e) {
    console.log(e);
  }
}

export async function telegramSendMessage(chat_id, i18opts, opts) {
  const { text, options } = i18opts;
  const lang = await getLangByChatID(chat_id);
  processI18Options(options, lang);
  let res = null;

  try {
    res = await tBot.sendMessage(
      chat_id,
      text ? i18next.t(text, { ...options, lng: lang }) : i18opts,
      translateInlineKeyboard(opts, lang)
    );
  } catch (e) {
    if (e.message.startsWith(ERROR_TELEGRAM_FORBIDDEN)) {
      handleBlockedToSendMessage(opts.chat_id);
    } else {
      console.log(e);
    }
  }

  return res;
}

export async function handleBlockedToSendMessage(chat_id) {
  const team = await Team.findOne({ chat_id }).populate('players');
  if (!team) return;
  const { players } = team;

  team.delete().then(async () => {
    players.forEach(async (player) => {
      const teams = await Team.find({
        players: player._id,
      });
      if (teams.length) return;
      Player.findByIdAndRemove({ _id: player._id }, () => {
        webhookMgr.removePlayersFromList([player.player_id]);
      });

      console.log(
        `Successfully deleted team ${
          team.username || team.title || team.chat_id
        }`
      );
    });
  });
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
