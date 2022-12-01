import puppeteer from 'puppeteer';

import { getBasicTelegramOptions } from '../utils/index.js';

let page = await getBrowserPage();

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
      console.log('+img');
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

export { sendPhoto, calculateAverage, isPlayerTeamMember };
