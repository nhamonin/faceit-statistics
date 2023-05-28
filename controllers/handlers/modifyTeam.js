import { addPlayer, deletePlayer, resetTeam } from '#services';
import {
  getTelegramBot,
  telegramSendMessage,
  telegramEditMessage,
  telegramDeleteMessage,
  getDefaultTelegramCallbackOptions,
  getEventEmitter,
  logEvent,
} from '#utils';
import { modifyTeamMarkup, addPlayerOnlyMarkup } from '#telegramReplyMarkup';

const tBot = getTelegramBot();
const eventEmitter = getEventEmitter();

async function handleAddPlayer(opts) {
  const defaultOpts = getDefaultTelegramCallbackOptions();

  await telegramSendMessage(
    opts.chat_id,
    {
      text: 'addPlayer.sendNickname',
    },
    {
      ...defaultOpts,
    }
  ).then(({ message_id: bot_message_id, chat }) => {
    tBot.onReplyToMessage(
      opts.chat_id,
      bot_message_id,
      async ({ text: nickname, message_id }) => {
        const listenerName = `addingPlayerProcess-${opts.chat_id}-${nickname}`;
        telegramDeleteMessage(opts.chat_id, message_id);
        telegramDeleteMessage(opts.chat_id, bot_message_id);
        await telegramEditMessage(
          {
            text: 'addPlayer.inProgress',
            options: { nickname },
          },
          {
            ...opts,
            ...modifyTeamMarkup,
          }
        );

        eventEmitter.on(listenerName, async (text, options) => {
          await telegramEditMessage(
            { text, options },
            {
              ...opts,
              ...modifyTeamMarkup,
            }
          );
        });

        const { text, options } = await addPlayer(
          nickname,
          opts.chat_id,
          message_id
        );

        eventEmitter.removeAllListeners([listenerName]);
        logEvent(chat, `Add player: ${nickname}`);
        await telegramEditMessage(
          { text, options },
          {
            ...opts,
            ...modifyTeamMarkup,
          }
        );
      }
    );
  });
}

async function handleDeletePlayer(opts, callbackQuery) {
  const nickname = callbackQuery.data.split('?')[1];
  const { text, options } = await deletePlayer(nickname, opts.chat_id);
  const markup =
    text === 'deletePlayer.lastWasDeleted'
      ? addPlayerOnlyMarkup
      : modifyTeamMarkup;

  logEvent(callbackQuery.message.chat, `Delete player: ${nickname}`);
  await telegramEditMessage(
    { text, options },
    {
      ...opts,
      ...markup,
    }
  );
}

async function handleResetTeam(opts, msg) {
  const { text } = await resetTeam(opts.chat_id);
  logEvent(msg.chat, 'Reset team');
  await telegramEditMessage(
    { text },
    {
      ...opts,
      ...addPlayerOnlyMarkup,
    }
  );
}

export { handleAddPlayer, handleDeletePlayer, handleResetTeam };
