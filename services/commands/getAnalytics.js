import database from '#db';
import { webhookMgr } from '#utils';

export async function getAnalytics() {
  const matchPrediction = await database.matchPredictions.readBy({});
  const totalTempPredictions = await database.tempPredictions.getCount();
  const totalTeams = await database.teams.getCount();
  const totalPlayers = await database.players.getCount();
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
