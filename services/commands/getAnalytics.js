import { db, getCountByTableName, webhookMgr } from '#utils';

export async function getAnalytics() {
  const matchPrediction = await db('match_prediction').first();
  const totalTempPredictions = await getCountByTableName('temp_prediction');
  const totalTeams = await getCountByTableName('team');
  const totalPlayers = await getCountByTableName('player');
  const totalMatches = matchPrediction?.totalMatches || 0;
  const avgPredictions = matchPrediction?.avgPredictions || 0;
  const winratePrediction = matchPrediction?.winratePredictions || 0;
  const dataPayload = await webhookMgr.getWebhookDataPayload();
  const restrictions = dataPayload?.restrictions;
  const webhookListLength = restrictions?.length || 0;
  const text = [
    `winrate predictions: ${(
      (winratePrediction / totalMatches || 0) * 100
    ).toFixed(2)} %`,
    `avg predictions: ${((avgPredictions / totalMatches || 0) * 100).toFixed(
      2
    )} %`,
    '',
    `Total matches: ${totalMatches}`,
    `Pending matches: ${totalTempPredictions}`,
    '',
    `Total teams: ${totalTeams}`,
    `Total players: ${totalPlayers}`,
    `Webhook static list length: ${webhookListLength}`,
  ].join('\n');

  return text;
}
