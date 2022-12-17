import { chunk } from '../../utils/index.js';

const numberOfButtonsInRows = 3;

export const lastPlayerMatchesMarkup = (teamNicknames) => ({
  reply_markup: {
    inline_keyboard: [
      ...chunk(
        [
          ...teamNicknames.map((nickname) => ({
            text: nickname,
            callback_data: `getPlayerLastMatches?${nickname}`,
          })),
          ...[
            {
              text: 'Custom Player',
              callback_data: 'getPlayerLastMatches?custom',
            },
            {
              text: '« Back',
              callback_data: 'getStats',
            },
            {
              text: '« Back to Menu',
              callback_data: 'mainMenu',
            },
          ],
        ],
        numberOfButtonsInRows
      ),
    ],
    force_reply: true,
  },
});
