import database from '#db';
import { getSummaryStats } from '#services';
import { telegramSendMessage, sendPhoto, cacheWithExpiry } from '#utils';
import { getSummaryStatsTemplate } from '#templates';
import { subscriptionReceivedMarkup } from '#telegramReplyMarkup';
import { caches } from '#config';

export async function handleSummaryStatsAutoSend(matchID, chatIDs, playerIDs) {
  const addedToCache = cacheWithExpiry(
    caches.summaryStatsMatchIDs,
    matchID,
    1000 * 60 * 3
  );
  if (!addedToCache) return;

  chatIDs.map(async (chat_id) => {
    const team = await database.teams.readBy({ chat_id });
    const statusFinishedSubscriptions =
      team.settings.subscriptions.match_status_finished;
    if (!statusFinishedSubscriptions.summaryStats) return;
    const teamPlayers = await database.players.readAllByChatId(chat_id);
    const playedPlayers = teamPlayers
      .filter((player) => playerIDs.includes(player.player_id))
      .map(({ nickname }) => nickname);
    const { text, error } = await getSummaryStats(chat_id, playedPlayers);
    error
      ? await telegramSendMessage(chat_id, { text: text || error })
      : await sendPhoto([chat_id], null, getSummaryStatsTemplate(text));
    await telegramSendMessage(
      chat_id,
      {
        text: 'subscriptions.summaryStats.message',
        options: {
          teamNicknames: playedPlayers.join(', '),
          count: playedPlayers.length,
        },
      },
      {
        parse_mode: 'html',
        ...subscriptionReceivedMarkup('match_status_finished', 'summaryStats'),
      }
    );
  });
}
