export const chooseLanguageMarkup = (currentLang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: `buttons.chooseLanguage.en.${
            currentLang === 'en' ? 'current' : 'notCurrent'
          }`,
          callback_data: 'changeLanguage?en',
        },
        {
          text: `buttons.chooseLanguage.uk.${
            currentLang === 'uk' ? 'current' : 'notCurrent'
          }`,
          callback_data: 'changeLanguage?uk',
        },
      ],
      [
        {
          text: 'buttons.basic.back',
          callback_data: 'modifyTeamMarkup',
        },
        {
          text: 'buttons.basic.menu',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
});
