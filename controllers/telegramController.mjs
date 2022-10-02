process.env['NTBA_FIX_350'] = 1;

import path from 'path';
import fs from 'fs';

import { config } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import nodeHtmlToImage from 'node-html-to-image';

import { getEloTemplate } from '../public/templates/eloMessage.mjs';
import { getKDTemplate } from '../public/templates/kdMessage.mjs';
import { getTeamKdMessage } from '../services/getTeamKD.mjs';
import { getTeamEloMessage } from '../services/getTeamElo.mjs';
import { addPlayer } from '../services/addPlayerToTeam.mjs';
import { deletePlayer } from '../services/deletePlayerFromTeam.mjs';
import { initTeam } from '../services/initTeam.mjs';
import { DEFAULT_MATCH_LIMIT } from '../config/config.js';

config();
const tBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

function initBot() {
  tBot.onText(/\/start/, async ({ chat }) => {
    initTeam(chat.id);
    tBot.sendMessage(
      chat.id,
      'You are now able to add players to your list! Please do it via the command /add_player nickname.'
    );
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
    const { message, error } = await getTeamKdMessage(limit, chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto('kd.png', chat.id, getKDTemplate(limit, message));
  });
}

function initTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat }) => {
    const { message, error } = await getTeamEloMessage(chat.id);

    error
      ? tBot.sendMessage(chat.id, message)
      : sendPhoto('elo.png', chat.id, getEloTemplate(message));
  });
}

function sendPhoto(fileName, chatId, html) {
  const dir = './public/png';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  nodeHtmlToImage({
    output: './public/png/' + fileName,
    html,
  })
    .then(() => {
      console.log('The image was created successfully!');
      tBot.sendPhoto(
        chatId,
        path.join(process.cwd(), 'public', 'png', fileName)
      );
    })
    .catch((e) => {
      console.log(e.message);
    });
}

export {
  initBot,
  addPlayerListener,
  deletePlayerListener,
  initTeamStatsListener,
  initTeamEloListener,
};
