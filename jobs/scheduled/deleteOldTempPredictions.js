import database from '#db';

export async function deleteOldTempPredictions() {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await database.tempPredictions.deleteOlderThan(sixHoursAgo);

  console.log(
    'deleteOldTempPredictions done. Date:',
    new Date().toLocaleString()
  );
}
