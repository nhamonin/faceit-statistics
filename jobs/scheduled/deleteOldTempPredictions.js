import { db } from '#utils';

export async function deleteOldTempPredictions() {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await db('temp_predictions').where('created_at', '<', sixHoursAgo).delete();
}
