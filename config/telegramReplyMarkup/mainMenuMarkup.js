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
          url: 'https://www.buymeacoffee.com/faceithelper',
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
