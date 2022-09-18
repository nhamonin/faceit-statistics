import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

import getFaceitIDs from './utils/getFaceitIDs.mjs';
import getPlayersStats from './utils/getPlayersStats.mjs';

const playersNicknames = [
  'stolbn',
  'Grenat',
  'Zyw007',
  'DragoMag',
  'L-Jenkins',
];

dotenv.config();
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

bot.onText(/\/getstats/, async (msg) => {
  const chatId = msg.chat.id;
  const faceitIDs = await getFaceitIDs(playersNicknames);
  const playersStats = await getPlayersStats(faceitIDs);
  const playersElo = playersStats.map(
    (playerStats) => playerStats.games.csgo.faceit_elo
  );
  const prettiedMessage = playersElo
    .map((playerElo, index) => `${playersNicknames[index]}: ${playerElo}`)
    .join('\n');
  const avgTeamElo = playersElo.reduce((a, b) => a + b, 0) / playersElo.length;
  bot
    .sendMessage(chatId, prettiedMessage)
    .then(() => bot.sendMessage(chatId, `Avg Elo: ${avgTeamElo}`));
});
