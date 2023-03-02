import { MatchPredictionLast50, TempPredictionLast50 } from '#models';
import { currentMapPool } from '#config';
import { getMatchData } from '#utils';
import { matchPredictionLast50 } from 'models/matchPredictionLast50';

export async function performMapPickerAnalyticsLast50(match_id) {
  try {
    const tempPrediction = await TempPredictionLast50.findOne({ match_id });
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
    let matchPrediction = await MatchPredictionLast50.findOne();

    if (!matchPrediction) {
      matchPrediction = new MatchPredictionLast50({
        totalMatches: 1,
        winratePredictions: +winratePredictedValue,
        avgPredictions: +avgPredictedValue,
      });
    } else {
      matchPrediction.totalMatches++;
      if (winratePredictedValue) matchPrediction.winratePredictions++;
      if (avgPredictedValue) matchPrediction.avgPredictions++;
    }

    await matchPredictionLast50.save();
    await TempPredictionLast50.findOneAndDelete({ match_id });
  } catch (e) {
    console.log(e);
  }
}
