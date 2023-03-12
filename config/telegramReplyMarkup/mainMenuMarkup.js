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
      [
        {
          text: 'Donate',
          url: 'https://www.buymeacoffee.com/faceithelper',
        },
      ],
      [
        {
          text: 'Settings',
          callback_data: 'settingsMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
