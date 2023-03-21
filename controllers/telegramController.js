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
  chooseLanguageMarkup,
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

function initTelegramBotListener() {
  process.env.NTBA_FIX_350 = 1;
  process.env.NTBA_FIX_319 = 1;

  const tBot = getTelegramBot();

  tBot.onText(/\/start/, async ({ chat }) => {
    const team = await initTeam(chat);
    const { players } = await team.populate('players');
    const text = players.length ? 'welcomeBack' : 'start';
    const options = {
      players: players.map(({ nickname }) => nickname).join(', '),
    };

    await telegramSendMessage(
      chat.id,
      { text, options },
      {
        ...getBasicTelegramOptions(),
        ...(players.length ? mainMenuMarkup : addPlayerOnlyMarkup),
      }
    );
  });

  tBot.onText(/\/get_analytics/, async ({ chat, message_id }) => {
    const matchPrediction = await MatchPrediction.findOne().lean();
    const tempMatchesCount = await TempPrediction.countDocuments();
    const totalMatches = matchPrediction?.totalMatches || 0;
    const avgPredictions = matchPrediction?.avgPredictions || 0;
    const winratePrediction = matchPrediction?.winratePredictions || 0;
    const { restrictions } = await webhookMgr.getWebhookDataPayload();
    const webhookListLength = restrictions?.length || 0;
    const text = [
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

    await telegramSendMessage(
      chat.id,
      { text },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(/\/delete_analytics/, async ({ chat, message_id }) => {
    await Promise.allSettled([
      MatchPrediction.deleteMany(),
      TempPrediction.deleteMany(),
    ]);

    await telegramSendMessage(
      chat.id,
      { text: 'Success! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(
    /\/add_new_wh_players.* (\S*)/,
    async ({ chat, message_id }, match) => {
      const text = await addNewPlayersToWebhookList(match[1]);

      await telegramSendMessage(
        chat.id,
        { text },
        {
          ...getBasicTelegramOptions(message_id),
        }
      );
    }
  );

  tBot.onText(/\/sync_db_with_static_list/, async ({ chat, message_id }) => {
    await syncWebhookStaticListWithDB();
    await telegramSendMessage(
      chat.id,
      { text: 'Success! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(
    /\/limit_restrictions.* (\S*)/,
    async ({ chat, message_id }, match) => {
      await webhookMgr.limitRestrictions(+match[1]);
      await telegramSendMessage(
        chat.id,
        { text: 'Limit restrictions done! Now try /get_analytics command.' },
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

    await telegramSendMessage(
      chat.id,
      { text: 'Update players done! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data.split('?')[0];
    const msg = callbackQuery.message;
    const defaultOpts = {
      parse_mode: 'html',
      reply_markup: { force_reply: true },
    };
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...defaultOpts,
    };
    const team = await Team.findOne({ chat_id: opts.chat_id }).populate(
      'players'
    );
    const teamNicknames = getTeamNicknames(team);
    const subscriptions = team.settings.subscriptions;
    const lang = team.settings.lang;
    const isCalculateBestMapsSubscribed =
      subscriptions['match_object_created'].calculateBestMaps;
    const isSummaryStatsSubscribed =
      subscriptions['match_status_finished'].summaryStats;

    switch (action) {
      case 'mainMenu':
        await telegramEditMessage(
          {
            text: 'basicMenu',
            options: { teamNicknames: teamNicknames.join(', ') },
          },
          {
            ...opts,
            ...mainMenuMarkup,
          }
        );
        break;
      case 'modifyTeamMarkup':
        await telegramEditMessage(
          {
            text: 'basicMenu',
            options: { teamNicknames: teamNicknames.join(', ') },
          },
          {
            ...opts,
            ...modifyTeamMarkup,
          }
        );
        break;
      case 'addPlayer':
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
              const { text, options } = await addPlayer(
                nickname,
                opts.chat_id,
                message_id
              );
              logEvent(chat, `Add player: ${nickname}`);
              await telegramEditMessage(
                { text, options },
                {
                  ...opts,
                  ...modifyTeamMarkup,
                }
              );
              await telegramDeleteMessage(opts.chat_id, message_id);
              await telegramDeleteMessage(opts.chat_id, bot_message_id);
            }
          );
        });
        break;
      case 'deletePlayerMenu':
        await telegramEditMessage(
          {
            text: 'deletePlayer.select',
            options: { teamNicknames: teamNicknames.join(', ') },
          },
          {
            ...opts,
            ...deletePlayerMarkup(teamNicknames),
          }
        );
        break;
      case 'deletePlayer':
        {
          const nickname = callbackQuery.data.split('?')[1];
          const { text, options } = await deletePlayer(nickname, opts.chat_id);
          const markup =
            text === 'deletePlayer.lastWasDeleted'
              ? addPlayerOnlyMarkup
              : modifyTeamMarkup;
          logEvent(msg.chat, 'Delete player');
          await telegramEditMessage(
            { text, options },
            {
              ...opts,
              ...markup,
            }
          );
        }
        break;
      case 'resetTeam':
        {
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
        break;
      case 'getStats':
        await telegramEditMessage(
          {
            text: 'basicMenu',
            options: { teamNicknames: teamNicknames.join(', ') },
          },
          {
            ...opts,
            ...getStatsMarkup,
          }
        );
        break;
      case 'getSummaryStatsMenu':
        {
          const { text, error } = await getSummaryStats(opts.chat_id);
          logEvent(msg.chat, 'Get summary stats');
          error
            ? await telegramSendMessage(
                opts.chat_id,
                { text: text || error },
                getBasicTelegramOptions(opts.message_id)
              )
            : await sendPhoto(
                [opts.chat_id],
                null,
                getSummaryStatsTemplate(text)
              );
          await telegramDeleteMessage(opts.chat_id, opts.message_id);
          await telegramSendMessage(
            opts.chat_id,
            { text: 'doneSelectOneOfTheOptions' },
            {
              ...opts,
              ...getStatsMarkup,
            }
          );
        }
        break;
      case 'getTeamKDMenu':
        await telegramEditMessage(
          { text: 'getTeamKD.chooseLastMatchesAmount' },
          {
            ...opts,
            ...getTeamKDMenu,
          }
        );
        break;
      case 'getTeamKD':
        {
          const amount = callbackQuery.data.split('?')[1];

          if (amount !== 'custom') {
            getTeamKDWrapper(amount, opts);
            logEvent(msg.chat, `Get team KD last ${amount}`);
          } else {
            telegramSendMessage(
              opts.chat_id,
              { text: 'sendLastMatchesCount' },
              {
                ...defaultOpts,
              }
            ).then(({ message_id: bot_message_id }) => {
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
          const { text, options, error } = await getTeamEloMessage(
            opts.chat_id
          );
          logEvent(msg.chat, 'Get team Elo');
          error
            ? await telegramSendMessage(
                opts.chat_id,
                { text: error },
                getBasicTelegramOptions(opts.message_id)
              )
            : await sendPhoto(
                [opts.chat_id],
                null,
                getEloTemplate({ text, options })
              );
          await telegramDeleteMessage(opts.chat_id, opts.message_id);
          await telegramSendMessage(
            opts.chat_id,
            { text: 'doneSelectOneOfTheOptions' },
            {
              ...opts,
              ...getStatsMarkup,
            }
          );
        }
        break;
      case 'getPlayerLastMatchesMenu':
        await telegramEditMessage(
          { text: 'choosePlayer' },
          {
            ...opts,
            ...lastPlayerMatchesMarkup(teamNicknames),
          }
        );
        break;
      case 'getPlayerLastMatches':
        {
          const nickname = callbackQuery.data.split('?')[1];

          if (nickname !== 'custom') {
            await getPlayerLastMatchesWrapper(
              nickname,
              msg.chat,
              opts,
              teamNicknames
            );
          } else {
            telegramSendMessage(
              opts.chat_id,
              { text: 'sendPlayerNickname' },
              {
                ...defaultOpts,
              }
            ).then(async ({ message_id: bot_message_id }) => {
              await tBot.onReplyToMessage(
                opts.chat_id,
                bot_message_id,
                async ({ text: nickname, message_id }) => {
                  await getPlayerLastMatchesWrapper(
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
        await telegramEditMessage(
          { text: 'choosePlayer' },
          {
            ...opts,
            ...getHighestEloMenu(teamNicknames),
          }
        );
        break;
      case 'getHighestElo':
        {
          const nickname = callbackQuery.data.split('?')[1];

          await getHighestEloWrapper(nickname, teamNicknames, opts, msg.chat);
        }
        break;
      case 'settingsMenu':
        {
          await telegramEditMessage(
            { text: 'settings' },
            {
              ...opts,
              ...settingsMarkup,
            }
          );
        }
        break;
      case 'subscription':
        {
          const subscription = callbackQuery.data.split('?')[1];
          const [action, type, name] = subscription.split('-');

          subscriptions[type][name] = action === 'subscribe';
          logEvent(msg.chat, `${action}d ${name} subscription`);
          await team.save();
          await telegramEditMessage(
            { text: `subscriptions.${name}.${action}d` },
            {
              ...opts,
              ...manageSubscriptionsMarkup({
                isCalculateBestMapsSubscribed:
                  subscriptions['match_object_created'].calculateBestMaps,
                isSummaryStatsSubscribed:
                  subscriptions['match_status_finished'].summaryStats,
              }),
            }
          );
        }
        break;
      case 'manageSubscriptions':
        await telegramEditMessage(
          { text: 'subscriptions.manage' },
          {
            ...opts,
            ...manageSubscriptionsMarkup({
              isCalculateBestMapsSubscribed,
              isSummaryStatsSubscribed,
            }),
          }
        );

        break;
      case 'chooseLanguage':
        await telegramEditMessage(
          { text: 'chooseLanguage' },
          {
            ...opts,
            ...chooseLanguageMarkup(lang),
          }
        );
        break;
      case 'changeLanguage': {
        const newLanguage = callbackQuery.data.split('?')[1];
        if (lang === newLanguage) return;

        logEvent(msg.chat, `Changed language to ${newLanguage}`);
        team.settings.lang = newLanguage;
        await team.save();
        await telegramEditMessage(
          {
            text: `buttons.chooseLanguage.${newLanguage}.changedTo`,
          },
          { ...opts, ...chooseLanguageMarkup(newLanguage) }
        );
      }
    }
  });

  tBot.on('polling_error', (err) => {
    console.log(err);
  });
}

export { initTelegramBotListener };
