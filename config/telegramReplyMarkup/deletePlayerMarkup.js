import { chunk } from '#utils';

const numberOfButtonsInRows = 3;

export const deletePlayerMarkup = (teamNicknames) => ({
  reply_markup: {
    inline_keyboard: [
      ...chunk(
        [
          ...teamNicknames.map((nickname) => ({
            text: nickname,
            callback_data: `deletePlayer?${nickname}`,
          })),
        ],
        numberOfButtonsInRows
      ),
      [
        {
          text: 'buttons.basic.back',
          callback_data: 'modifyTeamMenu',
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
