import TelegramBot from 'node-telegram-bot-api';

import { getEloTemplate, getKDTemplate } from '../public/templates/index.js';
import {
  initTeam,
  getTeamEloMessage,
  getTeamKDMessage,
  addPlayer,
  deletePlayer,
  updateTeamPlayers,
} from '../services/index.js';
import {
  TELEGRAM_API_TOKEN,
  DEFAULT_MATCH_GET_LIMIT,
  messages,
} from '../config/config.js';
import { sendPhoto } from '../utils/index.js';

const tBot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

function initBotListener() {
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

function updateTeamPlayersListener() {
  tBot.onText(/\/update\_team\_players/, async ({ chat }, match) => {
    const message = await updateTeamPlayers(chat.id);
    tBot.sendMessage(chat.id, message);
  });
}

function initTeamKDListener() {
  tBot.onText(/\/get\_team\_kd[\w@]* ?(\d*)/, async ({ chat }, match) => {
    const limit = +match[1] || DEFAULT_MATCH_GET_LIMIT;
    const { message, error } = await getTeamKDMessage(limit, chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto(tBot, chat.id, getKDTemplate(limit, message));
  });
}

function initTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat }) => {
    const { message, error } = await getTeamEloMessage(chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto(tBot, chat.id, getEloTemplate(message));
  });
}

export {
  initBotListener,
  addPlayerListener,
  deletePlayerListener,
  updateTeamPlayersListener,
  initTeamKDListener,
  initTeamEloListener,
};
