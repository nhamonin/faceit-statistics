export const modifyTeamMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.modifyTeam.addPlayer',
          callback_data: 'addPlayer',
        },
        {
          text: 'buttons.modifyTeam.deletePlayer',
          callback_data: 'deletePlayerMenu',
        },
      ],
      [
        {
          text: 'buttons.modifyTeam.resetTeam',
          callback_data: 'resetTeam',
        },
        {
          text: 'buttons.basic.back',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
