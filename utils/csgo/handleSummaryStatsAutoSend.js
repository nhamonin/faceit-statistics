import database from '#db';
import { getSummaryStats } from '#services';
import { telegramSendMessage, sendPhoto, cacheWithExpiry } from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { subscriptionReceivedMarkup } from '#telegramReplyMarkup';
import { caches } from '#config';

export async function handleSummaryStatsAutoSend(matchID, chatIDs) {
  const addedToCache = cacheWithExpiry(
    caches.summaryStatsMatchIDs,
    matchID,
    1000 * 10
  );
  if (!addedToCache) return;

  chatIDs.map(async (chat_id) => {
    const team = await database.teams.readBy({ chat_id });
    const statusFinishedSubscriptions =
      team.settings.subscriptions.match_status_finished;
    if (!statusFinishedSubscriptions.summaryStats) return;
    const { text, error } = await getSummaryStats(chat_id);
    error
      ? await telegramSendMessage(chat_id, { text: text || error })
      : await sendPhoto([chat_id], null, getSummaryStatsTemplate(text));
    await telegramSendMessage(
      chat_id,
      {
        text: 'subscriptions.summaryStats.message',
      },
      {
        parse_mode: 'html',
        ...subscriptionReceivedMarkup('match_status_finished', 'summaryStats'),
      }
    );
  });
}
