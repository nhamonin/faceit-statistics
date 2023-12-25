import database from '#db';
import { webhookMgr, chunk, withErrorHandling } from '#utils';

export async function syncWebhookStaticListWithDB() {
  withErrorHandling(async () => {
    const playersIDs = await database.players.readAllPlayerIds();
    const { restrictions } = (await webhookMgr.getWebhookDataPayload()) || {};

    if (!restrictions) return;

    const playersIDsNotInWebHook = playersIDs.filter((player_id) => {
      const isPlayerInWebhook = restrictions.some(({ value }) => value === player_id);
      return !isPlayerInWebhook;
    });

    if (!playersIDsNotInWebHook.length) return;

    const playersIDsNotInWebHookChunks = chunk(playersIDsNotInWebHook, 5);

    for await (const playersChunked of playersIDsNotInWebHookChunks) {
      await webhookMgr.addPlayersToList(playersChunked);
    }

    console.log('syncWebhookStaticListWithDB done. Date:', new Date().toLocaleString());
  })();
}
