export const settingsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.settings.subscriptions',
          callback_data: 'manageSubscriptions',
        },
        {
          text: 'buttons.settings.language',
          callback_data: 'chooseLanguage',
        },
      ],
      [
        {
          text: 'buttons.basic.menu',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
