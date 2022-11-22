import TelegramBot from 'node-telegram-bot-api';

import { getEloTemplate, getKDTemplate } from '../public/templates/index.js';
import {
  initTeam,
  resetTeam,
  getTeamEloMessage,
  getTeamKDMessage,
  addPlayer,
  deletePlayer,
  updateTeamPlayers,
  getPlayerLastMatchesStats,
} from '../services/index.js';
import {
  TELEGRAM_API_TOKEN,
  DEFAULT_MATCH_GET_LIMIT,
  messages,
} from '../config/config.js';
import { sendPhoto, getBasicTelegramOptions } from '../utils/index.js';

const tBot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

function initBotListener() {
  tBot.onText(/\/start/, async ({ chat, message_id }) => {
    initTeam(chat);
    tBot.sendMessage(
      chat.id,
      messages.start,
      getBasicTelegramOptions(message_id)
    );
  });
}

function resetTeamListener() {
  tBot.onText(/\/reset\_team/, async ({ chat, message_id }) => {
    const { message, error } = await resetTeam(chat.id);

    tBot.sendMessage(
      chat.id,
      message || error,
      getBasicTelegramOptions(message_id)
    );
  });
}

function addPlayerListener() {
  tBot.onText(/\/add\_player.* (\S*)/, async ({ chat, message_id }, match) => {
    const message = await addPlayer(match[1], chat.id);
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
  });
}

function deletePlayerListener() {
  tBot.onText(
    /\/delete\_player[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const message = await deletePlayer(match[1], chat.id);
      tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
    }
  );
}

function updateTeamPlayersListener() {
  tBot.onText(/\/update\_team\_players/, async ({ chat, message_id }) => {
    const message = await updateTeamPlayers(chat.id);
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
  });
}

function getTeamKDListener() {
  tBot.onText(
    /\/get\_team\_kd[\w@]* ?(\d*)/,
    async ({ chat, message_id }, match) => {
      const limit = +match[1] || DEFAULT_MATCH_GET_LIMIT;
      const { message, error } = await getTeamKDMessage(limit, chat.id);

      error
        ? tBot.sendMessage(
            chat.id,
            message,
            getBasicTelegramOptions(message_id)
          )
        : sendPhoto(tBot, chat.id, message_id, getKDTemplate(limit, message));
    }
  );
}

function getTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat, message_id }) => {
    const { message, error } = await getTeamEloMessage(chat.id);

    error
      ? tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id))
      : sendPhoto(tBot, chat.id, message_id, getEloTemplate(message));
  });
}

function getPLayerLastMatchesStatsListener() {
  tBot.onText(
    /\/get\_player\_last\_matches[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const { message, error } = await getPlayerLastMatchesStats(
        chat.id,
        match[1]
      );

      tBot.sendMessage(
        chat.id,
        message || error,
        getBasicTelegramOptions(message_id)
      );
    }
  );
}

export {
  initBotListener,
  resetTeamListener,
  addPlayerListener,
  deletePlayerListener,
  updateTeamPlayersListener,
  getTeamKDListener,
  getTeamEloListener,
  getPLayerLastMatchesStatsListener,
};
