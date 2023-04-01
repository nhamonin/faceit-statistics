export const settingsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.settings.subscriptions',
          callback_data: 'manageSubscriptionsMenu',
        },
        {
          text: 'buttons.settings.language',
          callback_data: 'chooseLanguageMenu',
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
