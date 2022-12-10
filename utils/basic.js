import puppeteer from 'puppeteer-extra';

import { getBasicTelegramOptions } from '../utils/index.js';
import { bots, ENVIRONMENT } from '../config/config.js';

let page = await getBrowserPage();

function adjustConsoleLog() {
  const oldConsoleLog = console.log;
  const tBot = bots.telegram;
  const logsChatID = -886965844;

  console.log = function () {
    oldConsoleLog(...[...arguments]);
    if (ENVIRONMENT !== 'PRODUCTION') return;
    tBot.sendMessage(logsChatID, [...arguments].join(', '), {
      disable_notification: true,
    });
  };
}

function logEvent(chat, action) {
  const name = chat.username || chat.title;
  console.log(`${name}: ${action}. Date: ${new Date().toLocaleString()}`);
}

async function sendPhoto(tBot, chatId, message_id, html) {
  if (page) {
    await page.setContent(html);
  } else {
    page = await getBrowserPage();
    await page.setContent(html);
  }

  page
    .screenshot({
      fullPage: true,
    })
    .then((image) => {
      console.log('image was generated successfully', new Date().toLocaleString());
      tBot.sendPhoto(chatId, image, getBasicTelegramOptions(message_id));
    })
    .catch((e) => {
      console.log(e.message);
    });
}

async function getBrowserPage() {
  const browser = await puppeteer.launch({
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
    ],
  });
  return browser.newPage();
}

function calculateAverage(arr, digits = 2) {
  return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(digits);
}

function isPlayerTeamMember(players, name) {
  return players?.some(({ nickname }) => nickname === name);
}

export {
  adjustConsoleLog,
  logEvent,
  sendPhoto,
  calculateAverage,
  isPlayerTeamMember,
};
