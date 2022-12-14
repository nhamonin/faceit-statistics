export const addPlayerOnlyMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Add player',
          callback_data: 'addPlayer',
        },
      ],
    ],
    force_reply: true,
  },
};
