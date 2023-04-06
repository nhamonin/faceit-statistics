import database from '#db';

export async function deleteAnalytics() {
  await Promise.allSettled([
    database.matchPredictions.deleteAllBy({}),
    database.tempPredictions.deleteAllBy({}),
  ]);
}
