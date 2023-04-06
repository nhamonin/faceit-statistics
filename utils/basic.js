import fs from 'node:fs';
import os from 'node:os';
import { EventEmitter } from 'node:events';

import puppeteer from 'puppeteer-extra';

import database from '#db';
import {
  getBasicTelegramOptions,
  handleBlockedToSendMessage,
  telegramSendMessage,
  getTelegramBot,
} from '#utils';
import {
  isProduction,
  puppeteerArgs,
  ERROR_TELEGRAM_FORBIDDEN,
  chatToGetNotifications,
  eventEmitter,
} from '#config';

const browser = await getBrowser();

function adjustConsoleLog() {
  if (!isProduction) return;
  const oldConsoleLog = console.log;
  const logsChatID = -886965844;

  console.log = function () {
    oldConsoleLog(...[...arguments]);
    telegramSendMessage(logsChatID, [...arguments].join(' '), {
      disable_notification: true,
    });
  };
}

function logEvent(chat, action) {
  const name = chat.username || chat.title || chat.id;
  console.log(`${name}: ${action}. Date: ${new Date().toLocaleString()}`);
}

async function sendPhoto(chatIDs, message_id, html, logEnabled = true) {
  const tBot = getTelegramBot();
  const page = await browser.newPage();
  let image = null;

  await page.setContent(html);
  await wait(500);
  try {
    image = await page.screenshot({
      fullPage: true,
    });
    page.close();
  } catch (e) {
    console.log(e);
  }

  const chatsToSend =
    !logEnabled ||
    !isProduction ||
    (chatIDs.length === 1 && chatIDs[0] === 146612362)
      ? chatIDs
      : [...chatIDs, chatToGetNotifications];

  await Promise.all(
    chatsToSend.map(async (chat_id) => {
      try {
        await tBot.sendPhoto(
          chat_id,
          image,
          message_id ? getBasicTelegramOptions(message_id) : {}
        );
      } catch (e) {
        if (e.message.startsWith(ERROR_TELEGRAM_FORBIDDEN)) {
          await handleBlockedToSendMessage(chat_id);
        } else {
          console.log(e);
        }
      }
    })
  );
}

async function getBrowser() {
  return puppeteer.launch({
    headless: true,
    args: puppeteerArgs,
  });
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

function getDaysBetweenDates(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function localizeDate(date, locale) {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function wait(ms) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLangByChatID(chat_id) {
  const team = await database.teams.readBy({ chat_id });

  return team?.settings?.lang || 'en';
}

function getEventEmitter() {
  if (eventEmitter.main) return eventEmitter.main;
  eventEmitter.main = new EventEmitter();

  return eventEmitter.main;
}

function setEnvValue(key, value) {
  const ENV_VARS = fs.readFileSync('./.env', 'utf8').split(os.EOL);
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => line.match(new RegExp(key)))
  );

  ENV_VARS.splice(target, 1, `${key}=${value}`);
  fs.writeFileSync('./.env', ENV_VARS.join(os.EOL));
}

async function receiveArgs(req) {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}

function cacheWithExpiry(cache, key, timeout) {
  if (cache.has(key)) return false;

  cache.add(key);
  setTimeout(() => {
    cache.delete(key);
  }, timeout);

  return true;
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
  getDaysBetweenDates,
  localizeDate,
  wait,
  getLangByChatID,
  getEventEmitter,
  setEnvValue,
  receiveArgs,
  cacheWithExpiry,
};
