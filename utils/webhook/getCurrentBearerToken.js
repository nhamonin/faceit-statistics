import puppeteer from 'puppeteer';

import { FACEIT_APP_ID, FACEIT_WEBHOOK_ID, puppeteerArgs, loggedInCookie } from '#config';

const webhookEditURL = `https://developers.faceit.com/apps/${FACEIT_APP_ID}/webhooks/${FACEIT_WEBHOOK_ID}/edit`;
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
    console.error('Error while getting webhook token via puppeteer: ', e.message);
  } finally {
    await browser.close();
  }

  if (bearerToken)
    console.log(
      'Success on getting webhook token via puppeteer. Date:',
      new Date().toLocaleString()
    );

  return bearerToken;
}
