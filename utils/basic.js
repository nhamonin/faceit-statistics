import puppeteer from 'puppeteer-extra';

import {
  getBasicTelegramOptions,
  handleBotWasBlockedByTheUser,
  telegramSendMessage,
} from '#utils';
import {
  ENVIRONMENT,
  puppeteerArgs,
  ERROR_BOT_BLOCKED_BY_THE_USER,
} from '#config';

let page = await getBrowserPage();

function adjustConsoleLog() {
  if (ENVIRONMENT !== 'PRODUCTION') return;
  const oldConsoleLog = console.log;
  const logsChatID = -886965844;

  console.log = function () {
    oldConsoleLog(...[...arguments]);
    if (ENVIRONMENT !== 'PRODUCTION') return;
    telegramSendMessage(logsChatID, [...arguments].join(' '), {
      disable_notification: true,
    });
  };
}

function logEvent(chat, action) {
  const name = chat.username || chat.title || chat.id;
  console.log(`${name}: ${action}. Date: ${new Date().toLocaleString()}`);
}

async function sendPhoto(tBot, chatIDs, message_id, html) {
  let image = null;
  if (page) {
    await page.setContent(html);
  } else {
    page = await getBrowserPage();
    await page.setContent(html);
  }
  await wait(1000);
  try {
    image = await page.screenshot({
      fullPage: true,
    });
  } catch (e) {
    console.log(e.message);
  }

  await Promise.all(
    chatIDs.map(async (chat_id) => {
      try {
        await tBot.sendPhoto(
          chat_id,
          image,
          message_id ? getBasicTelegramOptions(message_id) : {}
        );
      } catch (e) {
        if (e.message === ERROR_BOT_BLOCKED_BY_THE_USER) {
          await handleBotWasBlockedByTheUser(chat_id);
        } else {
          console.log(e.message);
        }
      }
    })
  );
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

function getDaysBetweenDates(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
};
