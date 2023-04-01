export const subscriptionReceivedMarkup = (
  subscriptionType,
  subscriptionName
) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.menu.donate',
          url: 'https://www.buymeacoffee.com/faceithelper',
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
