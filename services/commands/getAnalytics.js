import database from '#db';
import { webhookMgr } from '#utils';

export async function getAnalytics() {
  const matchPrediction = await database.matchPredictions.readBy({});
  const totalTempPredictions = await database.tempPredictions.getCount();
  const totalTeams = await database.teams.getCount();
  const totalActiveTeams = await database.teamsPlayers.getActiveTeamsCount();
  const totalPlayers = await database.players.getCount();
  const totalMatches = matchPrediction?.totalMatches || 0;
  const avgPredictions = matchPrediction?.avgPredictions || 0;
  const winratePrediction = matchPrediction?.winratePredictions || 0;
  const webhookListLength = await webhookMgr.getRestrictionsCount();

  const actionThresholds = [0, 10, 100];
  const [totalActivePlayers, totalActivePlayersGt10, totalActivePlayersGt100] = await Promise.all(
    actionThresholds.map((threshold) =>
      database.teams
        .readAllBy({ actions_used: { '>': threshold } }) // Fetch rows with actions_used > threshold
        .then((res) => res?.length || 0)
    )
  );

  const text = [
    `winrate predictions: ${((winratePrediction / totalMatches || 0) * 100).toFixed(2)} %`,
    `avg predictions: ${((avgPredictions / totalMatches || 0) * 100).toFixed(2)} %`,
    '',
    `Total matches: ${totalMatches}`,
    `Pending matches: ${totalTempPredictions}`,
    '',
    `Total active teams: ${totalActiveTeams} (${(
      (totalActiveTeams / totalTeams || 0) * 100
    ).toFixed(2)} %)`,
    `Total players: ${totalPlayers}`,
    `Active players (>0 actions): ${totalActivePlayers}`,
    `Active players (>10 actions): ${totalActivePlayersGt10}`,
    `Active players (>100 actions): ${totalActivePlayersGt100}`,
    `Webhook static list length: ${webhookListLength}`,
  ].join('\n');

  return text;
}
