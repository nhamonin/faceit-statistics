import { db } from '#utils';

export async function deleteAnalytics() {
  await Promise.allSettled([
    db('match_prediction').delete(),
    db('temp_prediction').delete(),
  ]);
}
