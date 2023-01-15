import puppeteer from 'puppeteer-extra';
import recaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

import {
  ENVIRONMENT,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_ID_TEST,
  HCAPTCHA_API_KEY,
  puppeteerArgs,
  loggedInCookie,
} from '#config';

puppeteer.use(stealthPlugin());
puppeteer.use(
  recaptchaPlugin({
    provider: {
      id: '2captcha',
      token: HCAPTCHA_API_KEY,
    },
  })
);

const webhookID =
  ENVIRONMENT === 'PRODUCTION' ? FACEIT_WEBHOOK_ID : FACEIT_WEBHOOK_ID_TEST;
const webhookEditURL = `https://developers.faceit.com/apps/${FACEIT_APP_ID}/webhooks/${webhookID}/edit`;
const waitUntil = 'networkidle2';

export async function getCurrentBearerToken() {
  const browser = await puppeteer.launch({
    headless: true,
    args: puppeteerArgs,
    slowMo: 250,
  });
  let bearerToken;
  const page = await browser.newPage();
  await page.setCookie({
    url: 'https://accounts.faceit.com',
    ...loggedInCookie,
  });
  try {
    await page.goto(webhookEditURL, { waitUntil });
    await page.click('button');
    await new Promise((r) => setTimeout(r, 8000));
    bearerToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  } catch (e) {
    console.log('Error while getting webhook token via puppeteer: ', e.message);
  } finally {
    await browser.close();
  }

  if (bearerToken)
    console.log(
      'Success on getting webhook token via puppeteer. Date: ',
      new Date().toLocaleString()
    );

  return bearerToken;
}
