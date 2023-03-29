import cron from 'node-cron';

import { syncWebhookStaticListWithDB, deleteOldTempPredictions } from '#jobs';

export function runCrons() {
  cron.schedule('0 4 * * *', syncWebhookStaticListWithDB);
  cron.schedule('0 * * * *', deleteOldTempPredictions);
}
