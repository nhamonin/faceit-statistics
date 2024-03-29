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
        ],
        numberOfButtonsInRows
      ),
      [
        {
          text: 'buttons.basic.back',
          callback_data: 'getStatsMenu',
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
