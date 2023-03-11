import { Team, MatchPrediction, TempPrediction } from '#models';
import { getEloTemplate, getSummaryStatsTemplate } from '#templates';
import {
  initTeam,
  resetTeam,
  getTeamEloMessage,
  getSummaryStats,
  addPlayer,
  deletePlayer,
  updateTeamPlayers,
} from '#services';
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
  settingsMarkup,
  manageSubscriptionsMarkup,
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
  telegramSendMessage,
  telegramDeleteMessage,
  telegramEditMessage,
  webhookMgr,
} from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';
import strings from '#strings';

function initTelegramBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  const tBot = getTelegramBot();

  tBot.onText(
    /\/(start|reset\_team|add\_player.*|delete\_player.*|update\_team\_players|get\_team\_kd.*|get\_team\_elo|get\_player\_last\_matches.*)/,
    async ({ chat }) => {
      const players = await initTeam(chat);
      telegramSendMessage(chat.id, strings.start(players), {
        ...getBasicTelegramOptions(),
        ...startActionMarkup(players),
      });
    }
  );

  tBot.onText(/\/get_analytics/, async ({ chat, message_id }) => {
    const matchPrediction = await MatchPrediction.findOne().lean();
    const tempMatchesCount = await TempPrediction.countDocuments();
    const totalMatches = matchPrediction?.totalMatches || 0;
    const avgPredictions = matchPrediction?.avgPredictions || 0;
    const winratePrediction = matchPrediction?.winratePredictions || 0;
    const { restrictions } = await webhookMgr.getWebhookDataPayload();
    const webhookListLength = restrictions?.length || 0;
    const message = [
      `winrate predictions: ${(
        (winratePrediction / totalMatches || 0) * 100
      ).toFixed(2)} %`,
      `avg predictions: ${((avgPredictions / totalMatches || 0) * 100).toFixed(
        2
      )} %`,
      '',
      `Total matches: ${totalMatches}`,
      `Pending matches: ${tempMatchesCount}`,
      '',
      `Webhook static list length: ${webhookListLength}`,
    ].join('\n');

    telegramSendMessage(chat.id, message, {
      ...getBasicTelegramOptions(message_id),
    });
  });

  tBot.onText(/\/delete_analytics/, async ({ chat, message_id }) => {
    await Promise.allSettled([
      MatchPrediction.deleteMany(),
      TempPrediction.deleteMany(),
    ]);

    telegramSendMessage(chat.id, 'Success! Now try /get_analytics command.', {
      ...getBasicTelegramOptions(message_id),
    });
  });

  tBot.onText(
    /\/add_new_wh_players.* (\S*)/,
    async ({ chat, message_id }, match) => {
      const message = await addNewPlayersToWebhookList(match[1]);
      telegramSendMessage(chat.id, message, {
        ...getBasicTelegramOptions(message_id),
      });
    }
  );

  tBot.onText(/\/sync_db_with_static_list/, async ({ chat, message_id }) => {
    await syncWebhookStaticListWithDB();
    telegramSendMessage(
      chat.id,
      'Sync static list with db Done! Now try /get_analytics command.',
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(
    /\/limit_restrictions.* (\S*)/,
    async ({ chat, message_id }, match) => {
      await webhookMgr.limitRestrictions(+match[1]);
      telegramSendMessage(
        chat.id,
        'Limit restrictions done! Now try /get_analytics command.',
        {
          ...getBasicTelegramOptions(message_id),
        }
      );
    }
  );

  tBot.onText(/\/update_players/, async ({ chat, message_id }) => {
    const teams = (await Team.find().select('chat_id').lean()).map(
      ({ chat_id }) => chat_id
    );

    for await (const team of teams) {
      await updateTeamPlayers(team);
    }

    telegramSendMessage(
      chat.id,
      'Update players done! Now try /get_analytics command.',
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

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
    const subscriptions = team.settings.subscriptions;
    const isCalculateBestMapsSubscribed =
      subscriptions['match_object_created'].calculateBestMaps;
    const isSummaryStatsSubscribed =
      subscriptions['match_status_finished'].summaryStats;

    switch (action) {
      case 'mainMenu':
        telegramEditMessage(strings.basicMenu(teamNicknames), {
          ...opts,
          ...mainMenuMarkup,
        });
        break;
      case 'modifyTeamMarkup':
        telegramEditMessage(strings.basicMenu(teamNicknames), {
          ...opts,
          ...modifyTeamMarkup,
        });
        break;
      case 'addPlayer':
        telegramSendMessage(opts.chat_id, strings.addPlayer.sendNickname, {
          reply_markup: { force_reply: true },
        }).then(({ message_id: bot_message_id, chat }) => {
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
              telegramEditMessage(message, {
                ...opts,
                ...modifyTeamMarkup,
              });
              await telegramDeleteMessage(opts.chat_id, message_id);
              await telegramDeleteMessage(opts.chat_id, bot_message_id);
            }
          );
        });
        break;
      case 'deletePlayerMenu':
        telegramEditMessage(strings.deletePlayer.selectPlayer(teamNicknames), {
          ...opts,
          ...deletePlayerMarkup(teamNicknames),
        });
        break;
      case 'deletePlayer':
        {
          const nickname = callbackQuery.data.split('?')[1];
          const message = await deletePlayer(nickname, opts.chat_id);
          const options =
            message === strings.deletePlayer.lastPlayerWasDeleted
              ? addPlayerOnlyMarkup
              : modifyTeamMarkup;
          logEvent(msg.chat, 'Delete player');
          telegramEditMessage(message, {
            ...opts,
            ...options,
          });
        }
        break;
      case 'resetTeam':
        {
          const { message, error } = await resetTeam(opts.chat_id);
          logEvent(msg.chat, 'Reset team');
          telegramEditMessage(message || error, {
            ...opts,
            ...addPlayerOnlyMarkup,
          });
        }
        break;
      case 'getStats':
        telegramEditMessage(strings.basicMenu(teamNicknames), {
          ...opts,
          ...getStatsMarkup,
        });
        break;
      case 'getSummaryStatsMenu':
        {
          const { message, error } = await getSummaryStats(opts.chat_id);
          logEvent(msg.chat, 'Get summary stats');
          error
            ? await telegramSendMessage(
                opts.chat_id,
                message,
                getBasicTelegramOptions(opts.message_id)
              )
            : await sendPhoto(
                [opts.chat_id],
                null,
                getSummaryStatsTemplate(message)
              );
          await telegramDeleteMessage(opts.chat_id, opts.message_id);
          await telegramSendMessage(
            opts.chat_id,
            strings.selectOnOfTheOptions(true),
            {
              ...opts,
              ...getStatsMarkup,
            }
          );
        }
        break;
      case 'getTeamKDMenu':
        telegramEditMessage(strings.selectOnOfTheOptions(false), {
          ...opts,
          ...getTeamKDMenu,
        });
        break;
      case 'getTeamKD':
        {
          const amount = callbackQuery.data.split('?')[1];

          if (amount !== 'custom') {
            getTeamKDWrapper(amount, opts);
            logEvent(msg.chat, `Get team KD last ${amount}`);
          } else {
            telegramSendMessage(opts.chat_id, strings.sendLastMatchesCount, {
              reply_markup: { force_reply: true },
            }).then(({ message_id: bot_message_id }) => {
              tBot.onReplyToMessage(
                opts.chat_id,
                bot_message_id,
                async ({ text: amount, message_id }) => {
                  logEvent(msg.chat, `get team KD last ${amount}`);
                  await getTeamKDWrapper(amount, opts, message_id);
                  await telegramDeleteMessage(opts.chat_id, message_id);
                  await telegramDeleteMessage(opts.chat_id, bot_message_id);
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
            ? await telegramSendMessage(
                opts.chat_id,
                message,
                getBasicTelegramOptions(opts.message_id)
              )
            : await sendPhoto([opts.chat_id], null, getEloTemplate(message));
          await telegramDeleteMessage(opts.chat_id, opts.message_id);
          await telegramSendMessage(
            opts.chat_id,
            strings.selectOnOfTheOptions(true),
            {
              ...opts,
              ...getStatsMarkup,
            }
          );
        }
        break;
      case 'getPlayerLastMatchesMenu':
        telegramEditMessage(strings.selectOnOfTheOptions(false), {
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
            telegramSendMessage(opts.chat_id, strings.sendPlayerNickname, {
              reply_markup: { force_reply: true },
            }).then(async ({ message_id: bot_message_id }) => {
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
                  await telegramDeleteMessage(opts.chat_id, message_id);
                  await telegramDeleteMessage(opts.chat_id, bot_message_id);
                }
              );
            });
          }
        }
        break;
      case 'getHighestEloMenu':
        telegramEditMessage(strings.selectOnOfTheOptions(false), {
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
            telegramSendMessage(opts.chat_id, strings.sendPlayerNickname, {
              reply_markup: { force_reply: true },
            }).then(async ({ message_id: bot_message_id }) => {
              await tBot.onReplyToMessage(
                opts.chat_id,
                bot_message_id,
                async ({ text: nickname, message_id }) => {
                  logEvent(msg.chat, `Get Highest Elo: ${nickname}`);
                  await telegramDeleteMessage(opts.chat_id, message_id);
                  await telegramDeleteMessage(opts.chat_id, bot_message_id);
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
      case 'settingsMenu':
        {
          telegramEditMessage(strings.settings, {
            ...opts,
            ...settingsMarkup,
          });
        }
        break;
      case 'subscription':
        {
          const subscription = callbackQuery.data.split('?')[1];
          const [action, type, name] = subscription.split('-');

          subscriptions[type][name] = action === 'subscribe';

          logEvent(msg.chat, `${action}d ${name} subscription`);

          await team.save();

          telegramEditMessage(strings.subscriptions[name][`${action}d`], {
            ...opts,
            ...manageSubscriptionsMarkup({
              isCalculateBestMapsSubscribed:
                subscriptions['match_object_created'].calculateBestMaps,
              isSummaryStatsSubscribed:
                subscriptions['match_status_finished'].summaryStats,
            }),
          });
        }
        break;
      case 'manageSubscriptions':
        telegramEditMessage(strings.subscriptions.manage, {
          ...opts,
          ...manageSubscriptionsMarkup({
            isCalculateBestMapsSubscribed,
            isSummaryStatsSubscribed,
          }),
        });

        break;
      case 'chooseLanguage':
        telegramEditMessage(strings.comingSoon, {
          ...opts,
          ...settingsMarkup,
        });
        break;
    }
  });

  tBot.on('polling_error', (err) => {
    console.log(err);
  });
}

export { initTelegramBotListener };
