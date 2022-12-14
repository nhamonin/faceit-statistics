export const deletePlayerMarkup = (teamNicknames) => ({
  reply_markup: {
    inline_keyboard: [
      [
        ...teamNicknames.map((nickname) => ({
          text: nickname,
          callback_data: 'deletePlayerAction',
        })),
      ],
      [
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
    force_reply: true,
  },
});
