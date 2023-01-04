import { chunk } from '#utils';

const numberOfButtonsInRows = 3;

export const getHighestEloMenu = (teamNicknames) => ({
  reply_markup: {
    inline_keyboard: [
      ...chunk(
        [
          ...teamNicknames.map((nickname) => ({
            text: nickname,
            callback_data: `getHighestElo?${nickname}`,
          })),
          ...[
            {
              text: 'Custom Player',
              callback_data: 'getHighestElo?custom',
            },
            {
              text: '« Back',
              callback_data: 'getStats',
            },
            {
              text: '« Menu',
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
