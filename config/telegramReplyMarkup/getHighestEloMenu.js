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
              text: 'buttons.basic.custom',
              callback_data: 'getHighestElo?custom',
            },
          ],
        ],
        numberOfButtonsInRows
      ),
      [
        {
          text: 'buttons.basic.back',
          callback_data: 'getStats',
        },
        {
          text: 'buttons.basic.menu',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
});
