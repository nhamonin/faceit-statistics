export const getStatsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Team's Summary Statistics",
          callback_data: 'getSummaryStatsMenu',
        },
      ],
      [
        {
          text: "Team's K/D ratio",
          callback_data: 'getTeamKDMenu',
        },
        {
          text: "Team's Elo",
          callback_data: 'getTeamElo',
        },
      ],
      [
        {
          text: "Player's Highest Elo",
          callback_data: 'getHighestEloMenu',
        },
        {
          text: "Player's Matches",
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
