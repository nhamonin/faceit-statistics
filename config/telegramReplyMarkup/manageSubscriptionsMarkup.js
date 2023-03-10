export const manageSubscriptionsMarkup = ({
  isCalculateBestMapsSubscribed,
  isSummaryStatsSubscribed,
}) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: `Best maps: ${
            isCalculateBestMapsSubscribed ? 'Unsubscribe ❌' : 'Subscribe ✅'
          }`,
          callback_data: `subscription?${
            isCalculateBestMapsSubscribed ? 'un' : ''
          }subscribe-match_object_created-calculateBestMaps`,
        },
      ],
      [
        {
          text: `Summary statistics: ${
            isSummaryStatsSubscribed ? 'Unsubscribe ❌' : 'Subscribe ✅'
          }`,
          callback_data: `subscription?${
            isSummaryStatsSubscribed ? 'un' : ''
          }subscribe-match_status_finished-summaryStats`,
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
