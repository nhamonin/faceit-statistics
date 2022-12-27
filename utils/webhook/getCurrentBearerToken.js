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
  HCAPTCHA_API_KEY,
  puppeteerArgs,
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
  });
  const page = await browser.newPage();
  let bearerToken = null;
  try {
    page.on('response', async (res) => {
      if (res.url() === 'https://api.faceit.com/auth/v1/oauth/token') {
        try {
          const response = await res.json();
          bearerToken = {
            token: response.access_token,
            expiresIn: response.expires_in,
          };
        } catch (e) {}
      }
    });
    await page.goto(webhookEditURL, { waitUntil });
    await fillCredentials(page, 200);
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1000));
    await page.solveRecaptchas();
    await page.click('button[type="submit"]');
  } catch (e) {
    console.log('Error while getting webhook token via puppeteer: ', e.message);
  }
  await browser.close();

  if (bearerToken)
    console.log(
      'Success on getting webhook token via puppeteer. Date: ',
      new Date().toLocaleString()
    );
  return bearerToken;
}

async function fillCredentials(page, ms) {
  await page.type('#email', FACEIT_EMAIL);
  await new Promise((r) => setTimeout(r, ms));
  await page.type('#password', FACEIT_PASSWORD);
  await new Promise((r) => setTimeout(r, ms));
}
