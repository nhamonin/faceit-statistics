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
              text: 'Custom',
              callback_data: 'getHighestElo?custom',
            },
          ],
        ],
        numberOfButtonsInRows
      ),
      [
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
    force_reply: true,
  },
});
