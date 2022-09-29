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
  tBot.onText(/\/delete\_player.* (\S*)/, async ({ chat }, match) => {
    const message = await deletePlayer(match[1], chat.id);
    tBot.sendMessage(chat.id, message);
  });
}

function initTeamStatsListener() {
  tBot.onText(/\/get\_team\_kd.* ?(\d*)/, async ({ chat }, match) => {
    const kdMessage = await getTeamKdMessage(+match[1], chat.id);
    sendPhoto('kd.png', chat.id, getKDTemplate(kdMessage));
  });
}

function initTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat }) => {
    const eloMessage = await getTeamEloMessage(chat.id);
    sendPhoto('elo.png', chat.id, getEloTemplate(eloMessage));
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
