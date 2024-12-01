export const subscriptionReceivedMarkup = (subscriptionType, subscriptionName) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.menu.donate',
          url: 'https://send.monobank.ua/jar/2AWXbMbuWH',
        },
        {
          text: 'buttons.subscriptions.unsubscribe',
          callback_data: `subscription?unsubscribe-${subscriptionType}-${subscriptionName}`,
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
});
