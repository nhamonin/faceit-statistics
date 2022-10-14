import puppeteer from 'puppeteer';

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

async function sendPhoto(tBot, chatId, html) {
  process.env['NTBA_FIX_350'] = 1;

  await page.setContent(html);
  page
    .screenshot({
      fullPage: true,
    })
    .then((image) => {
      console.log('The image was created successfully!');
      tBot.sendPhoto(chatId, image);
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

export { sendPhoto, calculateAverage, isPlayerTeamMember };
