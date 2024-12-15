import fs from 'node:fs';
import os from 'node:os';
import { EventEmitter } from 'node:events';

import puppeteer from 'puppeteer';
import i18next from 'i18next';

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
  TELEGRAM_LOGS_CHAT_ID,
  TELEGRAM_ADMIN_CHAT_ID,
  eventEmitter,
} from '#config';

const browser = await getBrowser();

function adjustConsoleLog() {
  if (!isProduction) return;
  const oldConsoleLog = console.log;

  console.log = function () {
    oldConsoleLog(...[...arguments]);
    telegramSendMessage(TELEGRAM_LOGS_CHAT_ID, [...arguments].join(' '), {
      disable_notification: true,
    });
  };
}

function adjustConsoleError() {
  if (!isProduction) return;
  const oldConsoleError = console.error;

  console.error = function (e) {
    oldConsoleError(e);
    const errorMessage = e.stack || e.toString();
    telegramSendMessage(TELEGRAM_LOGS_CHAT_ID, errorMessage, {
      disable_notification: true,
    });
  };
}

function adjustConsolesBehavior() {
  adjustConsoleLog();
  adjustConsoleError();
}

function logEvent(chat, action) {
  const name = chat.username || chat.title || chat.id;
  console.log(`${name}: ${action}. Date: ${new Date().toLocaleString()}`);
}

async function sendPhoto(chatIDs, message_id, html, logEnabled = true) {
  const tBot = getTelegramBot();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  let image = null;

  try {
    await page.setContent(html);

    await page.waitForNetworkIdle({
      idleTime: 500,
      timeout: 15000,
    });

    await withErrorHandling(async () => {
      image = await page.screenshot({
        fullPage: true,
        type: 'webp',
      });
    })();
  } catch (e) {
    console.log(e);
  } finally {
    await page.close();
    await context.close();
  }

  const chatsToSend =
    !logEnabled || !isProduction || (chatIDs.length === 1 && chatIDs[0] === +TELEGRAM_ADMIN_CHAT_ID)
      ? chatIDs
      : [...chatIDs, TELEGRAM_LOGS_CHAT_ID];

  await Promise.all(
    chatsToSend.map((chat_id) =>
      withErrorHandling(
        async () => {
          await tBot.sendPhoto(
            chat_id,
            Buffer.from(image),
            message_id ? getBasicTelegramOptions(message_id) : {}
          );
        },
        async (e) => {
          if (e.message.startsWith(ERROR_TELEGRAM_FORBIDDEN)) {
            await handleBlockedToSendMessage(chat_id);
          } else {
            console.log(e);
          }
        }
      )()
    )
  );
}

async function getBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: puppeteerArgs,
    ignoreHTTPSErrors: true,
  });

  process.on('beforeExit', async () => {
    await browser.close();
  });

  process.on('SIGINT', async () => {
    await browser.close();
    process.exit();
  });

  return browser;
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
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => line.match(new RegExp(key))));

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
  if (isProduction && (!cache || cache.has(key))) return false;

  cache.add(key);
  setTimeout(() => {
    cache.delete(key);
  }, timeout);

  return true;
}

function withErrorHandling(fn, errorObj, options = { log: true }) {
  return async function (...args) {
    try {
      return await fn(...args);
    } catch (e) {
      if (options?.log) {
        console.error(e);
      }
      return {
        error: errorObj?.error,
        text: errorObj?.errorMessage,
        options: errorObj?.errorOptions,
      };
    }
  };
}

function actionTracking(chat_id) {
  return database.teams.incrementActionUsage(chat_id);
}

async function fetchData(url, options) {
  options = options || {
    retries: 3,
    delay: 1000,
    headers: {},
    method: 'GET',
    body: null,
  };
  const { retries, delay, headers, method, body } = options;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0,
          ...headers,
        },
        method,
        body,
      });

      if (!res.ok) {
        if (res.status === 404) {
          return;
        } else if ([400, 401, 405, 410].includes(res.status)) {
          throw new Error(`HTTP error! status: ${res.status}. No retries.`);
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      }

      return res.json();
    } catch (e) {
      if (e.message.includes('No retries') || i === retries - 1)
        throw new Error(
          `Failed after ${i + 1} attempts. URL: ${url}. Original error: ${e.message}`
        );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function prepareEmptyTeamResult(lng) {
  return {
    errorMessage: i18next.t('images.errors.noPlayers', { lng }),
  };
}

export {
  adjustConsolesBehavior,
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
  withErrorHandling,
  actionTracking,
  fetchData,
  prepareEmptyTeamResult,
};
