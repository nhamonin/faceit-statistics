import { chunk } from '../../utils/index.js';

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
          ...[
            {
              text: '« Back',
              callback_data: 'modifyTeamMarkup',
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
