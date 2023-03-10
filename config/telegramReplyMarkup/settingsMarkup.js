export const settingsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Manage subscriptions',
          callback_data: 'manageSubscriptions',
        },
        {
          text: 'Choose language',
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
