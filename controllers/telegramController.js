import { Faceit } from 'faceit-node-api';

import {
  Team,
  MatchPrediction,
  MatchPredictionLast50,
  TempPrediction,
  TempPredictionLast50,
} from '#models';
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

function initTelegramBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  const tBot = getTelegramBot();

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
    const matchPredictionLast50 = await MatchPredictionLast50.findOne();
    const tempMatchesCountLast50 = await TempPredictionLast50.countDocuments();
    const totalMatches = matchPrediction?.totalMatches || 0;
    const avgPredictions = matchPrediction?.avgPredictions || 0;
    const winratePrediction = matchPrediction?.winratePredictions || 0;
    const totalMatchesLast50 = matchPredictionLast50?.totalMatches || 0;
    const avgPredictionsLast50 = matchPredictionLast50?.avgPredictions || 0;
    const winratePredictionLast50 =
      matchPredictionLast50?.winratePredictions || 0;
    const message = [
      `winrate predictions lifetime: ${(
        (winratePrediction / totalMatches || 0) * 100
      ).toFixed(2)} %`,
      `avg predictions lifetime: ${(
        (avgPredictions / totalMatches || 0) * 100
      ).toFixed(2)} %`,
      '',
      `winrate predictions last 50: ${(
        (winratePredictionLast50 / totalMatchesLast50 || 0) * 100
      ).toFixed(2)} %`,
      `avg predictions last 50: ${(
        (avgPredictionsLast50 / totalMatchesLast50 || 0) * 100
      ).toFixed(2)} %`,
      '',
      `Total matches lifetime: ${totalMatches}`,
      `Pending matches lifetime: ${tempMatchesCount}`,
      '',
      `Total matches last 50: ${totalMatchesLast50}`,
      `Pending matches last 50: ${tempMatchesCountLast50}`,
      '',
      `Current hour Faceit API load: ${Faceit.prototype._counter / 2}`,
    ].join('\n');

    tBot.sendMessage(chat.id, message, {
      ...getBasicTelegramOptions(message_id),
    });
  });

  tBot.onText(/\/delete_analytics/, async ({ chat, message_id }) => {
    await Promise.allSettled([
      MatchPrediction.deleteMany(),
      MatchPredictionLast50.deleteMany(),
      TempPrediction.deleteMany(),
      TempPredictionLast50.deleteMany(),
    ]);

    tBot.sendMessage(chat.id, 'Success! Now try /get_analytics command.', {
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
        editMessageText(messages.basicMenu(teamNicknames), {
          ...opts,
          ...mainMenuMarkup,
        });
        break;
      case 'modifyTeamMarkup':
        editMessageText(messages.basicMenu(teamNicknames), {
          ...opts,
          ...modifyTeamMarkup,
        });
        break;
      case 'addPlayer':
        tBot
          .sendMessage(opts.chat_id, messages.addPlayer.sendNickname, {
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
                editMessageText(message, {
                  ...opts,
                  ...modifyTeamMarkup,
                });
                await deleteMessage(opts.chat_id, message_id);
                await deleteMessage(opts.chat_id, bot_message_id);
              }
            );
          });
        break;
      case 'deletePlayerMenu':
        editMessageText(messages.deletePlayer.selectPlayer(teamNicknames), {
          ...opts,
          ...deletePlayerMarkup(teamNicknames),
        });
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
          editMessageText(message, {
            ...opts,
            ...options,
          });
        }
        break;
      case 'resetTeam':
        {
          const { message, error } = await resetTeam(opts.chat_id);
          logEvent(msg.chat, 'Reset team');
          editMessageText(message || error, {
            ...opts,
            ...addPlayerOnlyMarkup,
          });
        }
        break;
      case 'getStats':
        editMessageText(messages.basicMenu(teamNicknames), {
          ...opts,
          ...getStatsMarkup,
        });
        break;
      case 'getTeamKDMenu':
        editMessageText(messages.selectOnOfTheOptions(false), {
          ...opts,
          ...getTeamKDMenu,
        });
        break;
      case 'getTeamKD':
        {
          const amount = callbackQuery.data.split('?')[1];

          if (amount !== 'custom') {
            getTeamKDWrapper(tBot, amount, opts);
            logEvent(msg.chat, `Get team KD last ${amount}`);
          } else {
            tBot
              .sendMessage(opts.chat_id, messages.sendLastMatchesCount, {
                reply_markup: { force_reply: true },
              })
              .then(({ message_id: bot_message_id }) => {
                tBot.onReplyToMessage(
                  opts.chat_id,
                  bot_message_id,
                  async ({ text: amount, message_id }) => {
                    logEvent(msg.chat, `get team KD last ${amount}`);
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
            messages.selectOnOfTheOptions(true),
            {
              ...opts,
              ...getStatsMarkup,
            }
          );
        }
        break;
      case 'getPlayerLastMatchesMenu':
        editMessageText(messages.selectOnOfTheOptions(false), {
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
              .sendMessage(opts.chat_id, messages.sendPlayerNickname, {
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
        editMessageText(messages.selectOnOfTheOptions(false), {
          ...opts,
          ...getHighestEloMenu(teamNicknames),
        });
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
              .sendMessage(opts.chat_id, messages.sendPlayerNickname, {
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

  tBot.on('polling_error', (err) => {
    console.log(err);
  });
}

export { initTelegramBotListener };
