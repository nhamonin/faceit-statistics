import cron from 'node-cron';

import {
  syncWebhookStaticListWithDB,
  deleteOldTempPredictions,
  performUpdatePlayers,
} from '#jobs';
import { webhookMgr } from '#utils';

export function runCrons() {
  performUpdatePlayers();

  cron.schedule('0 4 * * *', syncWebhookStaticListWithDB);
  cron.schedule('0 * * * *', deleteOldTempPredictions);
  cron.schedule('*/10 * * * *', webhookMgr.getWebhookDataPayload);
  cron.schedule('0 */6 * * *', performUpdatePlayers);
}
