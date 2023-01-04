export const mainMenuMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Statistics',
          callback_data: 'getStats',
        },
        {
          text: 'Modify team',
          callback_data: 'modifyTeamMarkup',
        },
      ],
    ],
    force_reply: true,
  },
};
