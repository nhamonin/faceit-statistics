export const getStatsMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Get team K/D',
          callback_data: 'getTeamKDMenu',
        },
        {
          text: 'Get team Elo rating',
          callback_data: 'getTeamElo',
        },
      ],
      [
        {
          text: 'Get player last matches',
          callback_data: 'getPlayerLastMatchesMenu',
        },
        {
          text: '« Back',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
