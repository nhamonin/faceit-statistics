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
import { DEFAULT_MATCH_GET_LIMIT, messages, bots } from '../config/config.js';
import {
  sendPhoto,
  getBasicTelegramOptions,
  getTelegramBot,
  logEvent,
} from '../utils/index.js';

bots.telegram = getTelegramBot();
const tBot = bots.telegram;

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
    initTeam(chat);
    logEvent(chat, 'Init team');
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
    logEvent(chat, 'Reset team');
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
    logEvent(chat, 'Add player');
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
  });
}

function deletePlayerListener() {
  tBot.onText(
    /\/delete\_player[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const message = await deletePlayer(match[1], chat.id);
      logEvent(chat, 'Delete player');
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
      logEvent(chat, 'Get team K/D');
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
    logEvent(chat, 'Get team Elo');
    error
      ? tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id))
      : sendPhoto(tBot, chat.id, message_id, getEloTemplate(message));
  });
}

function getPLayerLastMatchesStatsListener() {
  tBot.onText(
    /\/get\_player\_last\_matches[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const { message, error } = await getPlayerLastMatchesStats(match[1]);
      logEvent(chat, 'Get player last matches stats');
      tBot.sendMessage(
        chat.id,
        message || error,
        getBasicTelegramOptions(message_id)
      );
    }
  );
}

export { initTelegramListeners };
