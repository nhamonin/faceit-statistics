import { Faceit } from 'faceit-node-api';

import { Team, MatchPrediction, TempPrediction } from '#models';
import { getEloTemplate } from '#templates';
import {
  initTeam,
  resetTeam,
  getTeamEloMessage,
  addPlayer,
  deletePlayer,
} from '#services';
import { messages } from '#config';
import {
  startActionMarkup,
  modifyTeamMarkup,
  mainMenuMarkup,
  deletePlayerMarkup,
  addPlayerOnlyMarkup,
  getStatsMarkup,
  getTeamKDMenu,
  lastPlayerMatchesMarkup,
  getHighestEloMenu,
} from '#telegramReplyMarkup';
import {
  sendPhoto,
  getBasicTelegramOptions,
  getTeamKDWrapper,
  getPlayerLastMatchesWrapper,
  getHighestEloWrapper,
  getTeamNicknames,
  getTelegramBot,
  logEvent,
  addNewPlayersToWebhookList,
  deleteMessage,
  editMessageText,
} from '#utils';

const tBot = getTelegramBot();

function initTelegramBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  tBot.onText(
    /\/(start|reset\_team|add\_player.*|delete\_player.*|update\_team\_players|get\_team\_kd.*|get\_team\_elo|get\_player\_last\_matches.*)/,
    async ({ chat }) => {
      const players = await initTeam(chat);
      logEvent(chat, 'Init team');
      tBot.sendMessage(chat.id, messages.start(players), {
        ...getBasicTelegramOptions(),
        ...startActionMarkup(players),
      });
    }
  );

  tBot.onText(/\/get_analytics/, async ({ chat, message_id }) => {
    const matchPrediction = await MatchPrediction.findOne();
    const tempMatchesCount = await TempPrediction.countDocuments();
    const totalMatches = matchPrediction.totalMatches || 0;
    const avgPredictions = matchPrediction.avgPredictions || 0;
    const winratePrediction = matchPrediction.winratePredictions || 0;
    const message = [
      `winrate predictions: ${
        ((winratePrediction / totalMatches) * 100).toFixed(2) || '-'
      } %`,
      `avg predictions: ${
        ((avgPredictions / totalMatches) * 100).toFixed(2) || '-'
      } %`,
      '',
      `Total matches: ${totalMatches}`,
      `Pending matches: ${tempMatchesCount}`,
      '',
      `Current hour Faceit API load: ${Faceit.prototype._counter / 2}`,
    ].join('\n');

    tBot.sendMessage(chat.id, message, {
      ...getBasicTelegramOptions(message_id),
    });
  });

  tBot.onText(
    /\/add_new_wh_players.* (\S*)/,
    async ({ chat, message_id }, match) => {
      const message = await addNewPlayersToWebhookList(match[1]);
      tBot.sendMessage(chat.id, message, {
        ...getBasicTelegramOptions(message_id),
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
        editMessageText(
          `Your team: <b>${teamNicknames.join(
            ', '
          )}</b>.\nChoose one of the options below:`,
          {
            ...opts,
            ...mainMenuMarkup,
          }
        );
      } catch (e) {}
      break;
    case 'modifyTeamMarkup':
      try {
        editMessageText(
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
        .then(({ message_id: bot_message_id, chat }) => {
          tBot.onReplyToMessage(
            opts.chat_id,
            bot_message_id,
            async ({ text: nickname, message_id }) => {
              const message = await addPlayer(
                nickname,
                opts.chat_id,
                message_id
              );
              logEvent(chat, `Add player: ${nickname}`);
              try {
                editMessageText(message, {
                  ...opts,
                  ...modifyTeamMarkup,
                });
              } catch (e) {}
              await deleteMessage(opts.chat_id, message_id);
              await deleteMessage(opts.chat_id, bot_message_id);
            }
          );
        });
      break;
    case 'deletePlayerMenu':
      try {
        editMessageText(
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
          editMessageText(message, {
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
          editMessageText(message || error, {
            ...opts,
            ...addPlayerOnlyMarkup,
          });
        } catch (e) {}
      }
      break;
    case 'getStats':
      try {
        editMessageText(
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
        editMessageText('Select one of the options below:', {
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
            .then(({ message_id: bot_message_id }) => {
              tBot.onReplyToMessage(
                opts.chat_id,
                bot_message_id,
                async ({ text: amount, message_id }) => {
                  await getTeamKDWrapper(tBot, amount, opts, message_id);

                  await deleteMessage(opts.chat_id, message_id);
                  await deleteMessage(opts.chat_id, bot_message_id);
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
          : await sendPhoto(
              tBot,
              [opts.chat_id],
              null,
              getEloTemplate(message)
            );
        await deleteMessage(opts.chat_id, opts.message_id);
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
      editMessageText('Select option below:', {
        ...opts,
        ...lastPlayerMatchesMarkup(teamNicknames),
      });
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
                  await deleteMessage(opts.chat_id, message_id);
                  await deleteMessage(opts.chat_id, bot_message_id);
                }
              );
            });
        }
      }
      break;
    case 'getHighestEloMenu':
      try {
        editMessageText('Select one of the options below:', {
          ...opts,
          ...getHighestEloMenu(teamNicknames),
        });
      } catch (e) {}
      break;
    case 'getHighestElo':
      {
        const nickname = callbackQuery.data.split('?')[1];

        if (nickname !== 'custom') {
          await getHighestEloWrapper(
            tBot,
            nickname,
            teamNicknames,
            opts,
            msg.chat
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
                  logEvent(msg.chat, `Get Highest Elo: ${nickname}`);
                  await deleteMessage(opts.chat_id, message_id);
                  await deleteMessage(opts.chat_id, bot_message_id);
                  await getHighestEloWrapper(
                    tBot,
                    nickname,
                    teamNicknames,
                    opts,
                    msg.chat
                  );
                }
              );
            });
        }
      }
      break;
  }
});

export { initTelegramBotListener };
