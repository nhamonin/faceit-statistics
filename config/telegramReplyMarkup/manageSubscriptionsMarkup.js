export const manageSubscriptionsMarkup = ({
  isCalculateBestMapsSubscribed,
  isSummaryStatsSubscribed,
}) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: `buttons.subscriptions.bestMaps${
            isCalculateBestMapsSubscribed ? 'Subscribed' : 'Unsubscribed'
          }`,
          callback_data: `subscription?${
            isCalculateBestMapsSubscribed ? 'un' : ''
          }subscribe-match_object_created-calculateBestMaps`,
        },
      ],
      [
        {
          text: `buttons.subscriptions.summaryStats${
            isSummaryStatsSubscribed ? 'Subscribed' : 'Unsubscribed'
          }`,
          callback_data: `subscription?${
            isSummaryStatsSubscribed ? 'un' : ''
          }subscribe-match_status_finished-summaryStats`,
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
