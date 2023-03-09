import { getSummaryStats } from '#services';
import { telegramSendMessage, sendPhoto } from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { getStatsMarkup } from '#telegramReplyMarkup';
import { caches } from '#config';
import strings from '#strings';

export async function handleSummaryStatsAutoSend(matchID, chatIDs) {
  if (caches.summaryStatsMatchIDs.has(matchID)) return;
  caches.summaryStatsMatchIDs.add(matchID);
  setTimeout(() => {
    caches.summaryStatsMatchIDs.delete(matchID);
  }, 1000 * 10);

  chatIDs.map(async (chat_id) => {
    const { message, error } = await getSummaryStats(chat_id);
    error
      ? await telegramSendMessage(chat_id, message)
      : await sendPhoto([chat_id], null, getSummaryStatsTemplate(message));
    await telegramSendMessage(chat_id, strings.selectOnOfTheOptions(true), {
      ...getStatsMarkup,
    });
  });
}
