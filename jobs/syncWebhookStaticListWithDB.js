import { Player } from '#models';
import { webhookMgr } from '#utils';

export async function syncWebhookStaticListWithDB() {
  try {
    const players = await Player.find();
    const playersIDs = players.map(({ player_id }) => player_id);
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
