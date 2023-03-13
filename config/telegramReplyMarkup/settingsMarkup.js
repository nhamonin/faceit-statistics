export const settingsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Subscriptions',
          callback_data: 'manageSubscriptions',
        },
        {
          text: 'Language',
          callback_data: 'chooseLanguage',
        },
      ],
      [
        {
          text: '« Back',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
