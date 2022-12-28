import puppeteer from 'puppeteer-extra';

import { getBasicTelegramOptions } from '#utils';
import { bots, ENVIRONMENT, puppeteerArgs } from '#config';

let page = await getBrowserPage();

function adjustConsoleLog() {
  if (ENVIRONMENT !== 'PRODUCTION') return;
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
  let image = null;
  if (page) {
    await page.setContent(html);
  } else {
    page = await getBrowserPage();
    await page.setContent(html);
  }

  try {
    image = await page.screenshot({
      fullPage: true,
    });
  } catch (e) {
    console.log(e.message);
  }

  message_id
    ? await tBot.sendPhoto(chatId, image, getBasicTelegramOptions(message_id))
    : await tBot.sendPhoto(chatId, image);
  console.log('image was generated successfully', new Date().toLocaleString());
}

async function getBrowserPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: puppeteerArgs,
  });

  return browser.newPage();
}

function calculateAverage(arr, digits = 2) {
  return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(digits);
}

function calculateDifference(a, b, digits = 2) {
  return +(a - b).toFixed(digits);
}

function isPlayerTeamMember(players, name) {
  return players?.some(({ nickname }) => nickname === name);
}

function chunk(arr, len) {
  let chunks = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}

function regulateWinrate(value) {
  if (value <= 65 && value >= 35) {
    return value;
  } else if (value >= 65) {
    return 65;
  } else {
    return 35;
  }
}

function regulateAvg(value) {
  if (value <= 25 && value >= 15) {
    return value;
  } else if (value >= 25) {
    return 25;
  } else {
    return 15;
  }
}

export {
  adjustConsoleLog,
  logEvent,
  sendPhoto,
  calculateAverage,
  calculateDifference,
  isPlayerTeamMember,
  chunk,
  regulateWinrate,
  regulateAvg,
};
