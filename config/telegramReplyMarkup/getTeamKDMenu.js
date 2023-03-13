export const getTeamKDMenu = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '10',
          callback_data: 'getTeamKD?10',
        },
        {
          text: '20',
          callback_data: 'getTeamKD?20',
        },
        {
          text: '50',
          callback_data: 'getTeamKD?50',
        },
        {
          text: 'Custom',
          callback_data: 'getTeamKD?custom',
        },
      ],
      [
        {
          text: '« Back',
          callback_data: 'getStats',
        },
        {
          text: '« Menu',
          callback_data: 'mainMenu',
        },
      ],
    ],
    force_reply: true,
  },
};
