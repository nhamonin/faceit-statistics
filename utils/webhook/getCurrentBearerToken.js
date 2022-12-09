import puppeteer from 'puppeteer-extra';
import recaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

import {
  ENVIRONMENT,
  FACEIT_EMAIL,
  FACEIT_PASSWORD,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_ID_TEST,
  HCAPTCHA_API_KEY
} from '../../config/config.js';

puppeteer.use(stealthPlugin());
puppeteer.use(
  recaptchaPlugin({
    provider: {
      id: '2captcha',
      token: HCAPTCHA_API_KEY
    },
    solveScoreBased: true,
    solveInactiveChallenges: true
  })
)

const webhookID = ENVIRONMENT === 'PRODUCTION' ? FACEIT_WEBHOOK_ID : FACEIT_WEBHOOK_ID_TEST;
const webhookEditURL = `https://developers.faceit.com/apps/${FACEIT_APP_ID}/webhooks/${webhookID}/edit`;
const nextButtonSelector = '.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary';
const waitUntil = 'networkidle2';

export async function getCurrentBearerToken() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  let authorizationHeader = null;
  try {
    await page.goto(webhookEditURL, { waitUntil });
    await page.type('#email', FACEIT_EMAIL);
    await new Promise(r => setTimeout(r, 200));
    await page.type('#password', FACEIT_PASSWORD);
    await new Promise(r => setTimeout(r, 200));
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.solveRecaptchas();
    await page.click('button[type="submit"]');
    await page.waitForSelector('.jss17');
    await page.goto(webhookEditURL, { waitUntil });
    await page.waitForSelector(nextButtonSelector);
    await page.click(nextButtonSelector);
    await new Promise(r => setTimeout(r, 500));
    await page.waitForSelector(nextButtonSelector);
    await page.click(nextButtonSelector);
    await new Promise(r => setTimeout(r, 500));
    await page.waitForSelector(nextButtonSelector);
    await page.click(nextButtonSelector);
    await new Promise(r => setTimeout(r, 500));
    page.on('request', request => {
      if (request.isInterceptResolutionHandled()) return;
      const requestHeaders = request.headers();
      if (requestHeaders.authorization) {
        authorizationHeader = requestHeaders.authorization;
      }
    });
    await page.waitForSelector(nextButtonSelector);
    await page.click(nextButtonSelector);
    await new Promise(r => setTimeout(r, 1500));
  } catch (e) {
    console.log('error', e);
  }
  await browser.close();
  return authorizationHeader;
}