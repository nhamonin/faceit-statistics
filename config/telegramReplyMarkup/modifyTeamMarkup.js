export const modifyTeamMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Add player',
          callback_data: 'addPlayer',
        },
        {
          text: 'Delete player',
          callback_data: 'deletePlayerMenu',
        },
      ],
      [
        {
          text: 'Reset team',
          callback_data: 'resetTeam',
        },
        {
          text: '« Back',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
