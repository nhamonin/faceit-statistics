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
      console.log('The image was created successfully!');
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

function calculateAverage(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function isPlayerTeamMember(players, name) {
  return players.some(({ nickname }) => nickname === name);
}

function groupByFive([a, b, c, d, e, ...rest]) {
  if (!rest.length) return [[a, b, c, d, e].filter(Boolean)];
  return [[a, b, c, d, e], ...groupByFive(rest)];
}

function clearPeriodically(dataToClear, clearValue, ms) {
  const MILLISECONDS_IN_SECOND = 1000;
  const SECONDS_IN_MINUTE = 60;

  const interval = setInterval(() => {
    dataToClear.value = clearValue;
  }, ms * MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE);

  return interval;
}

export {
  sendPhoto,
  calculateAverage,
  isPlayerTeamMember,
  groupByFive,
  clearPeriodically,
};
