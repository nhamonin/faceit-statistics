import puppeteer from 'puppeteer';

import { getBasicTelegramOptions } from '../utils/index.js';

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
const page = await browser.newPage();

async function sendPhoto(tBot, chatId, message_id, html) {
  process.env['NTBA_FIX_350'] = 1;

  await page.setContent(html);
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

export { sendPhoto, calculateAverage, isPlayerTeamMember, groupByFive };
