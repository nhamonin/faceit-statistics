export const getStatsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.stats.summary',
          callback_data: 'getSummaryStatsMenu',
        },
        {
          text: 'buttons.stats.kd',
          callback_data: 'getTeamKDMenu',
        },
        {
          text: 'buttons.stats.elo',
          callback_data: 'getTeamElo',
        },
      ],
      [
        {
          text: 'buttons.stats.highestElo',
          callback_data: 'getHighestEloMenu',
        },
        {
          text: 'buttons.stats.matches',
          callback_data: 'getPlayerLastMatchesMenu',
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
