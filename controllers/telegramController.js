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
  ENVIRONMENT,
  TELEGRAM_API_TOKEN,
  TELEGRAM_API_TOKEN_TEST,
  DEFAULT_MATCH_GET_LIMIT,
  messages,
} from '../config/config.js';
import { sendPhoto, getBasicTelegramOptions } from '../utils/index.js';

const tToken =
  ENVIRONMENT === 'PRODUCTION' ? TELEGRAM_API_TOKEN : TELEGRAM_API_TOKEN_TEST;
const tBot = new TelegramBot(tToken, { polling: true });

function initTelegramListeners() {
  initBotListener();
  resetTeamListener();
  addPlayerListener();
  deletePlayerListener();
  updateTeamPlayersListener();
  getTeamKDListener();
  getTeamEloListener();
  getPLayerLastMatchesStatsListener();
}

function initBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  tBot.onText(/\/start/, async ({ chat, message_id }) => {
    console.time('initTeam time');
    initTeam(chat);
    tBot.sendMessage(
      chat.id,
      messages.start,
      getBasicTelegramOptions(message_id)
    );
    console.timeEnd('initTeam time');
  });
}

function resetTeamListener() {
  tBot.onText(/\/reset\_team/, async ({ chat, message_id }) => {
    console.time('resetTeam time');
    const { message, error } = await resetTeam(chat.id);

    tBot.sendMessage(
      chat.id,
      message || error,
      getBasicTelegramOptions(message_id)
    );
    console.timeEnd('resetTeam time');
  });
}

function addPlayerListener() {
  tBot.onText(/\/add\_player.* (\S*)/, async ({ chat, message_id }, match) => {
    console.time(`addPlayer ${match[1]} time`);
    const message = await addPlayer(match[1], chat.id);
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
    console.timeEnd(`addPlayer ${match[1]} time`);
  });
}

function deletePlayerListener() {
  tBot.onText(
    /\/delete\_player[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      console.time(`deletePlayer ${match[1]} time`);
      const message = await deletePlayer(match[1], chat.id);
      tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
      console.timeEnd(`deletePlayer ${match[1]} time`);
    }
  );
}

function updateTeamPlayersListener() {
  tBot.onText(/\/update\_team\_players/, async ({ chat, message_id }) => {
    console.time('updateTeamPlayers time');
    const message = await updateTeamPlayers(chat.id);
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
    console.timeEnd('updateTeamPlayers time');
  });
}

function getTeamKDListener() {
  tBot.onText(
    /\/get\_team\_kd[\w@]* ?(\d*)/,
    async ({ chat, message_id }, match) => {
      const limit = +match[1] || DEFAULT_MATCH_GET_LIMIT;
      console.time(`getTeamKD ${limit} time`);
      const { message, error } = await getTeamKDMessage(limit, chat.id);

      error
        ? tBot.sendMessage(
            chat.id,
            message,
            getBasicTelegramOptions(message_id)
          )
        : sendPhoto(tBot, chat.id, message_id, getKDTemplate(limit, message));
      console.timeEnd(`getTeamKD ${limit} time`);
    }
  );
}

function getTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat, message_id }) => {
    console.time('getTeamElo time');
    const { message, error } = await getTeamEloMessage(chat.id);

    error
      ? tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id))
      : sendPhoto(tBot, chat.id, message_id, getEloTemplate(message));
    console.timeEnd('getTeamElo time');
  });
}

function getPLayerLastMatchesStatsListener() {
  tBot.onText(
    /\/get\_player\_last\_matches[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      console.time(`getPlayer ${match[1]} LastMatchesStats`);
      const { message, error } = await getPlayerLastMatchesStats(match[1]);

      tBot.sendMessage(
        chat.id,
        message || error,
        getBasicTelegramOptions(message_id)
      );
      console.timeEnd(`getPlayer ${match[1]} LastMatchesStats`);
      console.log(new Date().toLocaleString());
    }
  );
}

export { initTelegramListeners };
