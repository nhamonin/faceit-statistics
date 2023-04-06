import database from '#db';
import { telegramEditMessage, logEvent } from '#utils';
import {
  manageSubscriptionsMarkup,
  chooseLanguageMarkup,
} from '#telegramReplyMarkup';

async function handleManageSubscription(
  opts,
  team,
  subscriptions,
  callbackQuery
) {
  const subscription = callbackQuery.data.split('?')[1];
  const [action, type, name] = subscription.split('-');
  const msg = callbackQuery.message;

  subscriptions[type][name] = action === 'subscribe';
  logEvent(msg.chat, `${action}d ${name} subscription`);
  await database.teams.updateSettings(team.chat_id, {
    ...team.settings,
    subscriptions: subscriptions,
  });
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

async function handleChangeLanguage(opts, lang, team, callbackQuery) {
  const newLanguage = callbackQuery.data.split('?')[1];
  const msg = callbackQuery.message;
  if (lang === newLanguage) return;

  logEvent(msg.chat, `Changed language to ${newLanguage}`);
  team.settings.lang = newLanguage;
  await database.teams.updateSettings(team.chat_id, team.settings);
  await telegramEditMessage(
    {
      text: `buttons.chooseLanguage.${newLanguage}.changedTo`,
    },
    { ...opts, ...chooseLanguageMarkup(newLanguage) }
  );
}

export { handleManageSubscription, handleChangeLanguage };
