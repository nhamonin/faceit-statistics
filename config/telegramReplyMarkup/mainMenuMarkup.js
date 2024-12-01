export const mainMenuMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.menu.statistics',
          callback_data: 'getStatsMenu',
        },
        {
          text: 'buttons.menu.modifyTeam',
          callback_data: 'modifyTeamMenu',
        },
      ],
      [
        {
          text: 'buttons.menu.donate',
          url: 'https://send.monobank.ua/jar/2AWXbMbuWH',
        },
      ],
      [
        {
          text: 'buttons.menu.settings',
          callback_data: 'settingsMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
