process.env['NTBA_FIX_350'] = 1;

import TelegramBot from 'node-telegram-bot-api';
import nodeHtmlToImage from 'node-html-to-image';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { getEloMsg } from '../public/templates/eloMessage.mjs';
import { getKDMsg } from '../public/templates/kdMessage.mjs';
import { getTeamKdMessage } from '../services/getTeamKD.mjs';
import { getTeamEloMessage } from '../services/getTeamElo.mjs';

const tBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });
dotenv.config();

function tBotInit() {
  tBot.onText(/^\/start$/, function (msg) {
    tBot.sendMessage(
      msg.chat.id,
      'Hi team, check out some commands below I can do for you:',
      {
        reply_to_message_id: msg.message_id,
        reply_markup: {
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [{ text: 'Get Team Elo' }, { text: 'Get Team K/D (Last 20)' }],
          ],
        },
      }
    );
  });
}

function initTeamStatsListener() {
  tBot.onText(/Get Team K\/D \(Last 20\)/, async ({ chat }) => {
    const msg = await getTeamKdMessage();
    sendPhoto('kd.png', chat.id, getKDMsg(msg));
  });
}

function initTeamEloListener() {
  tBot.onText(/Get Team Elo/, async ({ chat }) => {
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
  }).then(() => {
    console.log('The image was created successfully!');
    tBot.sendPhoto(chatId, path.join(process.cwd(), 'public', 'png', fileName));
  });
}

export { tBotInit, initTeamStatsListener, initTeamEloListener };
