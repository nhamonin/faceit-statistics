export const getStatsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Summary',
          callback_data: 'getSummaryStatsMenu',
        },
        {
          text: 'K/D ratio',
          callback_data: 'getTeamKDMenu',
        },
        {
          text: 'Elo',
          callback_data: 'getTeamElo',
        },
      ],
      [
        {
          text: 'Highest Elo',
          callback_data: 'getHighestEloMenu',
        },
        {
          text: 'Matches',
          callback_data: 'getPlayerLastMatchesMenu',
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
