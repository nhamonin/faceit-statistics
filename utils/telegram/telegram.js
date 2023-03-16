import TelegramBot from 'node-telegram-bot-api';

import { Team, Player } from '#models';
import { webhookMgr } from '#utils';
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

export async function telegramEditMessage(text, opts) {
  try {
    await tBot.editMessageText(text, opts);
  } catch (e) {
    console.log(e);
  }
}

export async function telegramSendMessage(chat_id, text, opts) {
  let res = null;

  try {
    res = await tBot.sendMessage(chat_id, text, opts);
  } catch (e) {
    if (e.message.startsWith(ERROR_TELEGRAM_FORBIDDEN)) {
      handleBlockedToSendMessage(opts.chat_id);
    } else {
      console.log(e.message);
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
