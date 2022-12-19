import { Team } from '../models/index.js';
import { getEloTemplate } from '../public/templates/index.js';
import {
  initTeam,
  resetTeam,
  getTeamEloMessage,
  addPlayer,
  deletePlayer,
} from '../services/index.js';
import { messages, bots } from '../config/config.js';
import {
  startActionMarkup,
  modifyTeamMarkup,
  mainMenuMarkup,
  deletePlayerMarkup,
  addPlayerOnlyMarkup,
  getStatsMarkup,
  getTeamKDMenu,
  lastPlayerMatchesMarkup,
} from '../config/telegramReplyMarkup/index.js';
import {
  sendPhoto,
  getBasicTelegramOptions,
  getTeamKDWrapper,
  getPlayerLastMatchesWrapper,
  getTeamNicknames,
  getTelegramBot,
  logEvent,
} from '../utils/index.js';

bots.telegram = getTelegramBot();
const tBot = bots.telegram;

function initBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  tBot.onText(
    /\/(start|reset\_team|add\_player.*|delete\_player.*|update\_team\_players|get\_team\_kd.*|get\_team\_elo|get\_player\_last\_matches.*)/,
    async ({ chat, message_id }) => {
      const players = await initTeam(chat);
      logEvent(chat, 'Init team');
      tBot.sendMessage(chat.id, messages.start(players), {
        ...getBasicTelegramOptions(message_id),
        ...startActionMarkup(players),
      });
    }
  );

  tBot.on('polling_error', (err) => {
    console.log(err);
  });
}

tBot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data.split('?')[0];
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'html',
    reply_markup: { force_reply: true },
  };
  const team = await Team.findOne({ chat_id: opts.chat_id }).populate(
    'players'
  );
  const teamNicknames = getTeamNicknames(team);

  switch (action) {
    case 'mainMenu':
      try {
        tBot.editMessageText(
          `Your team: <b>${teamNicknames.join(
            ', '
          )}</b>.\nChose a player you want to delete:`,
          {
            ...opts,
            ...mainMenuMarkup,
          }
        );
      } catch (e) {}
      break;
    case 'modifyTeamMarkup':
      try {
        tBot.editMessageText(
          `Your team: <b>${teamNicknames.join(
            ', '
          )}</b>.\nSelect one of the options below:`,
          {
            ...opts,
            ...modifyTeamMarkup,
          }
        );
      } catch (e) {}
      break;
    case 'addPlayer':
      tBot
        .sendMessage(opts.chat_id, 'Send a nickname of the player', {
          reply_markup: { force_reply: true },
        })
        .then(({ message_id, chat }) => {
          tBot.onReplyToMessage(
            opts.chat_id,
            message_id,
            async ({ text: nickname, message_id }) => {
              const message = await addPlayer(
                nickname,
                opts.chat_id,
                message_id
              );
              logEvent(chat, `Add player: ${nickname}`);
              tBot.sendMessage(opts.chat_id, message, {
                ...getBasicTelegramOptions(message_id),
                ...modifyTeamMarkup,
              });
            }
          );
        });
      break;
    case 'deletePlayerMenu':
      try {
        tBot.editMessageText(
          `Your team: <b>${teamNicknames.join(
            ', '
          )}</b>.\nChose a player you want to delete:`,
          {
            ...opts,
            ...deletePlayerMarkup(teamNicknames),
          }
        );
      } catch (e) {}
      break;
    case 'deletePlayer':
      {
        const nickname = callbackQuery.data.split('?')[1];
        const message = await deletePlayer(nickname, opts.chat_id);
        const options =
          message === messages.deletePlayer.lastPlayerWasDeleted
            ? addPlayerOnlyMarkup
            : modifyTeamMarkup;
        logEvent(msg.chat, 'Delete player');
        try {
          tBot.editMessageText(message, {
            ...opts,
            ...options,
          });
        } catch (e) {}
      }
      break;
    case 'resetTeam':
      {
        const { message, error } = await resetTeam(opts.chat_id);
        logEvent(msg.chat, 'Reset team');
        try {
          tBot.editMessageText(message || error, {
            ...opts,
            ...addPlayerOnlyMarkup,
          });
        } catch (e) {}
      }
      break;
    case 'getStats':
      try {
        tBot.editMessageText(
          `Your team: <b>${teamNicknames.join(
            ', '
          )}</b>.\nSelect one of the options below:`,
          {
            ...opts,
            ...getStatsMarkup,
          }
        );
      } catch (e) {}
      break;
    case 'getTeamKDMenu':
      try {
        tBot.editMessageText('Select one of the options below:', {
          ...opts,
          ...getTeamKDMenu,
        });
      } catch (e) {}
      break;
    case 'getTeamKD':
      {
        const amount = callbackQuery.data.split('?')[1];

        if (amount !== 'custom') {
          getTeamKDWrapper(tBot, amount, opts);
        } else {
          tBot
            .sendMessage(
              opts.chat_id,
              'Send custom amount of the last matches:',
              {
                reply_markup: { force_reply: true },
              }
            )
            .then(({ message_id }) => {
              tBot.onReplyToMessage(
                opts.chat_id,
                message_id,
                async ({ text: amount, message_id }) => {
                  getTeamKDWrapper(tBot, amount, opts, message_id);
                }
              );
            });
        }
      }
      break;
    case 'getTeamElo':
      {
        const { message, error } = await getTeamEloMessage(opts.chat_id);
        logEvent(msg.chat, 'Get team Elo');
        error
          ? await tBot.sendMessage(
              opts.chat_id,
              message,
              getBasicTelegramOptions(message_id)
            )
          : await sendPhoto(tBot, opts.chat_id, null, getEloTemplate(message));
        await tBot.deleteMessage(opts.chat_id, opts.message_id);
        await tBot.sendMessage(
          opts.chat_id,
          'Done! Select one of the options below:',
          {
            ...opts,
            ...getStatsMarkup,
          }
        );
      }
      break;
    case 'getPlayerLastMatchesMenu':
      tBot.sendMessage(
        opts.chat_id,
        'Select option below:',
        lastPlayerMatchesMarkup(teamNicknames)
      );
      break;
    case 'getPlayerLastMatches':
      {
        const nickname = callbackQuery.data.split('?')[1];

        if (nickname !== 'custom') {
          await getPlayerLastMatchesWrapper(
            tBot,
            nickname,
            msg.chat,
            opts,
            teamNicknames
          );
        } else {
          tBot
            .sendMessage(opts.chat_id, 'Send player nickname:', {
              reply_markup: { force_reply: true },
            })
            .then(async ({ message_id: bot_message_id }) => {
              await tBot.onReplyToMessage(
                opts.chat_id,
                bot_message_id,
                async ({ text: nickname, message_id }) => {
                  await getPlayerLastMatchesWrapper(
                    tBot,
                    nickname,
                    msg.chat,
                    opts,
                    teamNicknames
                  );
                  tBot.deleteMessage(opts.chat_id, message_id);
                  tBot.deleteMessage(opts.chat_id, bot_message_id);
                }
              );
            });
        }
      }
      break;
  }
});

export { initBotListener };
