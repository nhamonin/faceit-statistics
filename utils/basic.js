import nodeHtmlToImage from 'node-html-to-image';

function sendPhoto(tBot, chatId, html) {
  process.env['NTBA_FIX_350'] = 1;

  nodeHtmlToImage({
    html,
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
