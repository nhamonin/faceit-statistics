import { Team } from '../models/index.js';
import { getEloTemplate, getKDTemplate } from '../public/templates/index.js';
import {
  initTeam,
  resetTeam,
  getTeamEloMessage,
  getTeamKDMessage,
  addPlayer,
  deletePlayer,
  updateTeamPlayers,
  getPlayerLastMatchesStats,
} from '../services/index.js';
import { DEFAULT_MATCH_GET_LIMIT, messages, bots } from '../config/config.js';
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

function initTelegramListeners() {
  initBotListener();
  resetTeamListener();
  deletePlayerListener();
  updateTeamPlayersListener();
  getTeamKDListener();
  getTeamEloListener();
  getPLayerLastMatchesStatsListener();
}

function initBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  tBot.onText(/\/start/, async ({ chat, message_id }) => {
    const players = await initTeam(chat);
    logEvent(chat, 'Init team');
    tBot.sendMessage(chat.id, messages.start(players), {
      ...getBasicTelegramOptions(message_id),
      ...startActionMarkup(players),
    });
  });

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

function resetTeamListener() {
  tBot.onText(/\/reset\_team/, async ({ chat, message_id }) => {
    const { message, error } = await resetTeam(chat.id);
    logEvent(chat, 'Reset team');
    tBot.sendMessage(
      chat.id,
      message || error,
      getBasicTelegramOptions(message_id)
    );
  });
}

function deletePlayerListener() {
  tBot.onText(
    /\/delete\_player[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const message = await deletePlayer(match[1], chat.id);
      logEvent(chat, 'Delete player');
      tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
    }
  );
}

function updateTeamPlayersListener() {
  tBot.onText(/\/update\_team\_players/, async ({ chat, message_id }) => {
    const message = await updateTeamPlayers(chat.id);
    tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id));
  });
}

function getTeamKDListener() {
  tBot.onText(
    /\/get\_team\_kd[\w@]* ?(\d*)/,
    async ({ chat, message_id }, match) => {
      logEvent(chat, 'Get team K/D');
      const limit = +match[1] || DEFAULT_MATCH_GET_LIMIT;
      const { message, error } = await getTeamKDMessage(limit, chat.id);

      error
        ? tBot.sendMessage(
            chat.id,
            message,
            getBasicTelegramOptions(message_id)
          )
        : sendPhoto(tBot, chat.id, message_id, getKDTemplate(limit, message));
    }
  );
}

function getTeamEloListener() {
  tBot.onText(/\/get\_team\_elo/, async ({ chat, message_id }) => {
    const { message, error } = await getTeamEloMessage(chat.id);
    logEvent(chat, 'Get team Elo');
    error
      ? tBot.sendMessage(chat.id, message, getBasicTelegramOptions(message_id))
      : sendPhoto(tBot, chat.id, message_id, getEloTemplate(message));
  });
}

function getPLayerLastMatchesStatsListener() {
  tBot.onText(
    /\/get\_player\_last\_matches[\w@]* (\S*)/,
    async ({ chat, message_id }, match) => {
      const { message, error } = await getPlayerLastMatchesStats(match[1]);
      logEvent(chat, 'Get player last matches stats');
      tBot.sendMessage(
        chat.id,
        message || error,
        getBasicTelegramOptions(message_id)
      );
    }
  );
}

export { initTelegramListeners };
