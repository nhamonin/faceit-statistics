export const getTeamKDMenu = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Last 20',
          callback_data: 'getTeamKD?20',
        },
        {
          text: 'Last 50',
          callback_data: 'getTeamKD?50',
        },
        {
          text: 'Custom Amount',
          callback_data: 'getTeamKD?custom',
        },
      ],
      [
        {
          text: '« Back',
          callback_data: 'getStats',
        },
        {
          text: '« Back to Menu',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};