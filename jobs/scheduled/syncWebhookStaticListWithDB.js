import { db, webhookMgr, chunk } from '#utils';

export async function syncWebhookStaticListWithDB() {
  try {
    const playersIDs = await db('player').pluck('player_id');
    const { restrictions } = await webhookMgr.getWebhookDataPayload();

    const playersIDsNotInWebHook = playersIDs.filter((player_id) => {
      const isPlayerInWebhook = restrictions.some(
        ({ value }) => value === player_id
      );
      return !isPlayerInWebhook;
    });

    if (playersIDsNotInWebHook.length) {
      const playersIDsNotInWebHookChunks = chunk(playersIDsNotInWebHook, 5);

      for await (const playersChunked of playersIDsNotInWebHookChunks) {
        await webhookMgr.addPlayersToList(playersChunked);
      }
    }
  } catch (e) {
    console.log(e);
  }
}