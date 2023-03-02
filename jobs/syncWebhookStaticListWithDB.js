import { Player } from '#models';
import { webhookMgr } from '#utils';

export async function syncWebhookStaticListWithDB() {
  try {
    const playersIDs = await Player.find().select('player_id').lean();
    const { restrictions } = await webhookMgr.getWebhookDataPayload();

    const playersIDsNotInWebHook = playersIDs.filter((player_id) => {
      const isPlayerInWebhook = restrictions.some(
        ({ value }) => value === player_id
      );
      return !isPlayerInWebhook;
    });

    if (playersIDsNotInWebHook.length) {
      await webhookMgr.addPlayersToList(playersIDsNotInWebHook);
    }
  } catch (e) {
    console.log(e.message);
  }
}
