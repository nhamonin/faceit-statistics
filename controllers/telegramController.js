import database from '#db';
import {
  getTeamNicknames,
  getTelegramBot,
  getDefaultTelegramCallbackOptions,
} from '#utils';
import {
  handleMenu,
  handleAddPlayer,
  handleDeletePlayer,
  handleResetTeam,
  handleSummary,
  handleTeamKD,
  handleTeamElo,
  handleHighestElo,
  handlePlayerLastMatches,
  handleManageSubscription,
  handleChangeLanguage,
} from './handlers/index.js';
import { initOnTextListeners } from './listeners/onTextListeners.js';
import { isProduction } from '#config';

function initTelegramBotListener() {
  const tBot = getTelegramBot();

  initOnTextListeners();

  tBot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data.split('?')[0];
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...getDefaultTelegramCallbackOptions(),
    };
    const team = await database.teams.readBy({ chat_id: opts.chat_id });
    const players = await database.players.readAllByChatId(opts.chat_id);
    const teamNicknames = getTeamNicknames(players);
    const subscriptions = team.settings.subscriptions;
    const lang = team.settings.lang;
    const isCalculateBestMapsSubscribed =
      subscriptions['match_object_created'].calculateBestMaps;
    const isSummaryStatsSubscribed =
      subscriptions['match_status_finished'].summaryStats;
    const actionHandlers = {
      mainMenu: () => handleMenu('mainMenu', opts, teamNicknames),
      modifyTeamMenu: () => handleMenu('modifyTeam', opts, teamNicknames),
      deletePlayerMenu: () => handleMenu('deletePlayer', opts, teamNicknames),
      getStatsMenu: () => handleMenu('stats', opts, teamNicknames),
      getTeamKDMenu: () => handleMenu('teamKD', opts, teamNicknames),
      getHighestEloMenu: () => handleMenu('highestElo', opts, teamNicknames),
      getPlayerLastMatchesMenu: () =>
        handleMenu('playerLastMatches', opts, teamNicknames),
      settingsMenu: () => handleMenu('settings', opts, teamNicknames),
      manageSubscriptionsMenu: () =>
        handleMenu('manageSubscriptions', opts, teamNicknames, {
          isCalculateBestMapsSubscribed,
          isSummaryStatsSubscribed,
        }),
      chooseLanguageMenu: () =>
        handleMenu('chooseLanguage', opts, teamNicknames, lang),
      addPlayer: () => handleAddPlayer(opts),
      deletePlayer: () => handleDeletePlayer(opts, callbackQuery),
      resetTeam: () => handleResetTeam(opts, msg),
      getSummaryStats: () => handleSummary(opts, msg),
      getTeamKD: () => handleTeamKD(opts, msg, callbackQuery),
      getTeamElo: () => handleTeamElo(opts, msg),
      getPlayerLastMatches: () =>
        handlePlayerLastMatches(opts, msg, teamNicknames, callbackQuery),
      getHighestElo: () =>
        handleHighestElo(opts, msg, teamNicknames, callbackQuery),
      subscription: () =>
        handleManageSubscription(opts, team, subscriptions, callbackQuery),
      changeLanguage: () =>
        handleChangeLanguage(opts, lang, team, callbackQuery),
    };

    if (actionHandlers[action]) {
      await actionHandlers[action]();
    } else {
      console.error(`Unhandled action: ${action}`);
    }
  });

  tBot.on(`${isProduction ? 'webhook' : 'polling'}_error`, (e) => {
    console.error(e);
  });
}

export { initTelegramBotListener };
