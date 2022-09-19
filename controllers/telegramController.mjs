process.env['NTBA_FIX_350'] = 1;

import TelegramBot from 'node-telegram-bot-api';
import nodeHtmlToImage from 'node-html-to-image';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { getEloMsg } from '../public/templates/eloMessage.mjs';
import { getTeamKdMessage } from '../services/getTeamKD.mjs';
import { getTeamEloMessage } from '../services/getTeamElo.mjs';

const tBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });
dotenv.config();

function getTeamStatsListener() {
  tBot.onText(/\/getTeamStats/, async ({ chat }) => {
    const msg = await getTeamKdMessage();
    tBot.sendMessage(chat.id, msg);
  });
}

function getTeamEloListener() {
  tBot.onText(/\/getTeamElo/, async ({ chat }) => {
    const msg = await getTeamEloMessage();
    sendPhoto('image.png', chat.id, getEloMsg(msg));
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
  }).then(() => {
    console.log('The image was created successfully!');
    tBot.sendPhoto(chatId, path.join(process.cwd(), 'public', 'png', fileName));
  });
}

export { getTeamStatsListener, getTeamEloListener };
