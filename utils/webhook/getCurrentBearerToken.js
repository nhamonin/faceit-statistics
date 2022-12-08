import puppeteer from 'puppeteer';

import { ENVIRONMENT } from '../../config/config.js';

export async function getCurrentBearerToken() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(
      'https://developers.faceit.com/apps/476f63e7-5bd0-489c-857b-7d8df614ec4b/webhooks/9f478782-6d50-4041-bd40-6afa72c7345d/edit',
      {
        waitUntil: 'networkidle2',
      }
    );
    await page.$eval('#email', (el) => (el.value = 'gamonin.nazar@gmail.com'));
    await page.$eval('#password', (el) => (el.value = 'ND2U99HL4U'));
    await page.screenshot({
      path: './credentials_filled.png',
      fullPage: true,
    });
    await page.click('button[type="submit"]');
    await page.waitForSelector('.jss17');
    await page.goto(
      'https://developers.faceit.com/apps/476f63e7-5bd0-489c-857b-7d8df614ec4b/webhooks/9f478782-6d50-4041-bd40-6afa72c7345d/edit',
      {
        waitUntil: 'networkidle2',
      }
    );
    await page.screenshot({
      path: './screenshot.png',
      fullPage: true,
    });
  } catch (e) {
    await page.screenshot({
      path: './error.png',
      fullPage: true,
    });
  }
  await browser.close();
}
