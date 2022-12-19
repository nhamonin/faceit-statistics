import TelegramBot from 'node-telegram-bot-api';

import {
  ENVIRONMENT,
  TELEGRAM_API_TOKEN,
  TELEGRAM_API_TOKEN_TEST,
} from '#config';

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
  const tToken =
    ENVIRONMENT === 'PRODUCTION' ? TELEGRAM_API_TOKEN : TELEGRAM_API_TOKEN_TEST;
  return new TelegramBot(tToken, { polling: true });
}
