import { Team } from '#models';
import { getSummaryStats } from '#services';
import { telegramSendMessage, sendPhoto } from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { subscriptionReceivedMarkup } from '#telegramReplyMarkup';
import { caches, chatToGetNotifications } from '#config';
import strings from '#strings';

export async function handleSummaryStatsAutoSend(matchID, chatIDs) {
  if (caches.summaryStatsMatchIDs.has(matchID)) return;
  caches.summaryStatsMatchIDs.add(matchID);
  setTimeout(() => {
    caches.summaryStatsMatchIDs.delete(matchID);
  }, 1000 * 10);

  chatIDs.map(async (chat_id) => {
    const statusFinishedSubscriptions = (await Team.findOne({ chat_id }))
      .settings.subscriptions.match_status_finished;
    if (!statusFinishedSubscriptions.summaryStats) return;
    const { message, error } = await getSummaryStats(chat_id);
    error
      ? await telegramSendMessage(chat_id, message)
      : await sendPhoto(
          [chat_id, chatToGetNotifications],
          null,
          getSummaryStatsTemplate(message)
        );
    await telegramSendMessage(
      chat_id,
      strings.subscriptions.summaryStats.message,
      {
        ...subscriptionReceivedMarkup('match_status_finished', 'summaryStats'),
      }
    );
  });
}
