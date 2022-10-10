import path from 'path';
import fs from 'fs';

import nodeHtmlToImage from 'node-html-to-image';

function sendPhoto(tBot, fileName, chatId, html) {
  process.env['NTBA_FIX_350'] = 1;

  const dir = './public/png';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  nodeHtmlToImage({
    output: './public/png/' + fileName,
    html,
  })
    .then(() => {
      console.log('The image was created successfully!');
      tBot.sendPhoto(
        chatId,
        path.join(process.cwd(), 'public', 'png', fileName)
      );
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
