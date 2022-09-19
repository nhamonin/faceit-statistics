import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import nodeHtmlToImage from 'node-html-to-image';

import getPlayersLastMatchesId from './utils/getPlayersLastMatchesId.mjs';
import getPlayersStats from './utils/getPlayersStats.mjs';
import getPlayersMatchesStats from './utils/getPlayersMatchesStats.mjs';
import {getEloMsg} from './html/eloMessage.mjs';

const playersNicknames = [
    'stolbn',
    'Grenat',
    'Zyw007',
    'DragoMag',
    'L-Jenkins',
];

const lvlClasses = {
    1: 'white',
    2: 'green',
    3: 'green',
    4: 'yellow',
    5: 'yellow',
    6: 'yellow',
    7: 'yellow',
    8: 'orange',
    9: 'orange',
    10: 'red',
};

dotenv.config();
const tBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

tBot.onText(/\/getTeamStats/, async (msg) => {
    const chatId = msg.chat.id;

    const playersStats = await getPlayersStats(playersNicknames);
    const playersId = playersStats.map(({playerId}) => playerId);

    const playersLastMatchesIds = await getPlayersLastMatchesId(playersId);
    const playersMatchesStats = await getPlayersMatchesStats(
        playersLastMatchesIds
    );
    const avgPlayersKD = playersMatchesStats.map(
        (playerMatchesStats) =>
            playerMatchesStats
                .map(({player_stats}) => +player_stats['K/D Ratio'])
                .reduce((a, b) => a + b, 0) / playerMatchesStats.length
    );

    const prettiedMessage = avgPlayersKD
        .map(
            (avgPlayerKD, index) =>
                `${playersNicknames[index]}: ${avgPlayerKD.toFixed(2)} K/D`
        )
        .join('\n');
    const avgTeamKD =
        avgPlayersKD.reduce((a, b) => a + b, 0) / avgPlayersKD.length;

    tBot.sendMessage(chatId, prettiedMessage + '\n\n' + `Avg K/D: ${avgTeamKD}`);
});

tBot.onText(/\/getTeamElo/, async (msg) => {
    const chatId = msg.chat.id;

    const playersStats = await getPlayersStats(playersNicknames);
    const prettiedMessage = playersStats
        .map(
            (playerStats) =>
                `${playerStats.nickname}: ${playerStats.elo} elo <span class=${lvlClasses[playerStats.lvl]}>(${playerStats.lvl} lvl)</span>`
        )
        .join('<br>');
    const playersElo = playersStats.map(({elo}) => elo);

    const avgTeamElo = playersElo.reduce((a, b) => a + b, 0) / playersElo.length;
    const avgEloMsg = `Avg Elo: ${avgTeamElo}`;

    nodeHtmlToImage({
        output: './png/image.png',
        html: getEloMsg(prettiedMessage),
        content: {avgEloMsg}
    })
        .then(() => {
            console.log('The image was created successfully!');
            tBot.sendPhoto(chatId, process.cwd() + '\\png\\image.png');
        });
});
