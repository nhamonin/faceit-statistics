export const addPlayerOnlyMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'buttons.modifyTeam.addPlayer',
          callback_data: 'addPlayer',
        },
      ],
    ],
    force_reply: true,
  },
};
