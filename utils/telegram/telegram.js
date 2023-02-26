import TelegramBot from 'node-telegram-bot-api';

import { isProduction, bots, port, TELEGRAM_BOT_API_TOKEN } from '#config';

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

export async function getTelegramBot() {
  if (bots.telegram) return bots.telegram;

  if (isProduction) {
    bots.telegram = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {
      webHook: {
        port,
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

    const webhookInfo = await bots.telegram.getWebHookInfo();
    console.log(webhookInfo);
  } else {
    bots.telegram = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });
  }

  return bots.telegram;
}

export async function deleteMessage(chat_id, message_id) {
  const tBot = getTelegramBot();

  try {
    await tBot.deleteMessage(chat_id, message_id);
  } catch (e) {}
}

export async function editMessageText(text, opts) {
  const tBot = getTelegramBot();

  try {
    await tBot.editMessageText(text, opts);
  } catch (e) {}
}
