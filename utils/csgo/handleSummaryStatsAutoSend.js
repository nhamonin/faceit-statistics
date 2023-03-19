import { Team } from '#models';
import { getSummaryStats } from '#services';
import { telegramSendMessage, sendPhoto } from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { subscriptionReceivedMarkup } from '#telegramReplyMarkup';
import { caches } from '#config';

export async function handleSummaryStatsAutoSend(matchID, chatIDs) {
  if (caches.summaryStatsMatchIDs.has(matchID)) return;
  caches.summaryStatsMatchIDs.add(matchID);
  setTimeout(() => {
    caches.summaryStatsMatchIDs.delete(matchID);
  }, 1000 * 10);

  chatIDs.map(async (chat_id) => {
    const team = await Team.findOne({ chat_id });
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
