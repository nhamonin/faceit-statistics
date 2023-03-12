export const subscriptionReceivedMarkup = (
  subscriptionType,
  subscriptionName
) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Donate',
          url: 'https://www.buymeacoffee.com/faceithelper',
        },
        {
          text: 'Unsubscribe',
          callback_data: `subscription?unsubscribe-${subscriptionType}-${subscriptionName}`,
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
});
