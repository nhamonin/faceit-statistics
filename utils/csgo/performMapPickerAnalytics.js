import { MatchPrediction, TempPrediction } from '#models';
import { currentMapPool } from '#config';
import { getMatchData } from '#utils';

export async function performMapPickerAnalytics(match_id) {
  try {
    const tempPrediction = await TempPrediction.findOne({ match_id });
    if (!tempPrediction) return;
    const { predictions } = tempPrediction;
    if (!predictions) return;
    const matchData = await getMatchData(match_id);
    const winner = matchData?.payload?.results[0]?.winner;
    const pickedMap = matchData?.payload?.voting?.map?.pick[0];
    if (!pickedMap && !winner && !currentMapPool.includes(pickedMap)) return;
    const predictedDataTeam = predictions[winner === 'faction1' ? 0 : 1];
    if (!predictedDataTeam) return;
    const predictedDataMap = predictedDataTeam.filter(
      (predictionObj) => predictionObj.mapName === pickedMap
    )[0];
    if (!predictedDataMap) return;
    const winratePredictedValue = predictedDataMap.totalWinrate > 0;
    const avgPredictedValue = predictedDataMap.totalPoints > 0;
    let matchPrediction = await MatchPrediction.findOne();

    if (!matchPrediction) {
      matchPrediction = new MatchPrediction({
        totalMatches: 1,
        winratePredictions: +winratePredictedValue,
        avgPredictions: +avgPredictedValue,
      });
    } else {
      matchPrediction.totalMatches++;
      if (winratePredictedValue) matchPrediction.winratePredictions++;
      if (avgPredictedValue) matchPrediction.avgPredictions++;
    }

    await matchPrediction.save();
    await TempPrediction.findOneAndDelete({ match_id });
  } catch (e) {
    console.log(e);
  }
}
