import cron from 'node-cron';

import { syncWebhookStaticListWithDB, deleteOldTempPredictions } from '#jobs';
import { webhookMgr } from '#utils';

export function runCrons() {
  cron.schedule('0 4 * * *', syncWebhookStaticListWithDB);
  cron.schedule('0 * * * *', deleteOldTempPredictions);
  cron.schedule('*/10 * * * *', webhookMgr.getWebhookDataPayload);
}
