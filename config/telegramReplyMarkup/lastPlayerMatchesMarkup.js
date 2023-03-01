import { chunk } from '#utils';

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
          {
            text: 'Custom Player',
            callback_data: 'getPlayerLastMatches?custom',
          },
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
