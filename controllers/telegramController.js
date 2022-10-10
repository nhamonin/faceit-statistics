import TelegramBot from 'node-telegram-bot-api';

import { getEloTemplate, getKDTemplate } from '../public/templates/index.js';
import {
  initTeam,
  getTeamEloMessage,
  getTeamKDMessage,
  addPlayer,
  deletePlayer,
} from '../services/index.js';
import {
  TELEGRAM_API_TOKEN,
  DEFAULT_MATCH_LIMIT,
  messages,
} from '../config/config.js';
import { sendPhoto } from '../utils/basic.js';

const tBot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

function initBot() {
  tBot.onText(/\/start/, async ({ chat }) => {
    initTeam(chat.id);
    tBot.sendMessage(chat.id, messages.start);
  });
}

function addPlayerListener() {
  tBot.onText(/\/add\_player.* (\S*)/, async ({ chat }, match) => {
    const message = await addPlayer(match[1], chat.id);
    tBot.sendMessage(chat.id, message);
  });
}

function deletePlayerListener() {
  tBot.onText(/\/delete\_player[\w@]* (\S*)/, async ({ chat }, match) => {
    const message = await deletePlayer(match[1], chat.id);
    tBot.sendMessage(chat.id, message);
  });
}

function initTeamStatsListener() {
  tBot.onText(/\/get\_team\_kd[\w@]* ?(\d*)/, async ({ chat }, match) => {
    const limit = +match[1] || DEFAULT_MATCH_LIMIT;
    const { message, error } = await getTeamKDMessage(limit, chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto(tBot, 'kd.png', chat.id, getKDTemplate(limit, message));
  });
}

function initTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat }) => {
    const { message, error } = await getTeamEloMessage(chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto(tBot, 'elo.png', chat.id, getEloTemplate(message));
  });
}

export {
  initBot,
  addPlayerListener,
  deletePlayerListener,
  initTeamStatsListener,
  initTeamEloListener,
};
