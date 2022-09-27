process.env['NTBA_FIX_350'] = 1;

import path from 'path';
import fs from 'fs';

import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import nodeHtmlToImage from 'node-html-to-image';

import { getEloMsg } from '../public/templates/eloMessage.mjs';
import { getKDMsg } from '../public/templates/kdMessage.mjs';
import { getTeamKdMessage } from '../services/getTeamKD.mjs';
import { getTeamEloMessage } from '../services/getTeamElo.mjs';

dotenv.config();
const tBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

function initBot() {
  tBot.onText(/\/start/, async ({ chat }) => {
    tBot.sendMessage(
      chat.id,
      'This bot can provide statistics for the RubickOn team(currently). Try it out by using /getTeamElo or /getTeamKD commands!'
    );
  });
}

function initTeamStatsListener() {
  tBot.onText(/\/get\_team\_kd/, async ({ chat }) => {
    const msg = await getTeamKdMessage();
    sendPhoto('kd.png', chat.id, getKDMsg(msg));
  });
}

function initTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat }) => {
    const msg = await getTeamEloMessage();
    sendPhoto('elo.png', chat.id, getEloMsg(msg));
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
    .catch((err) => console.log(err));
}

export { initBot, initTeamStatsListener, initTeamEloListener };
