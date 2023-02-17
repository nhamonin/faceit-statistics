import {
  MatchLast50,
  MatchPredictionLast50,
  TempPredictionLast50,
} from '#models';
import { currentMapPool } from '#config';
import { getMatchData } from '#utils';

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
    const match = new MatchLast50({
      match_id,
      winratePredictedValue: predictedDataMap.totalWinrate > 0,
      avgPredictedValue: predictedDataMap.totalPoints > 0,
    });
    let matchPrediction = await MatchPredictionLast50.findOne();
    match.save().then(async () => {
      if (!matchPrediction) {
        matchPrediction = new MatchPredictionLast50({
          totalMatches: 1,
          winratePredictions: +match.winratePredictedValue,
          avgPredictions: +match.avgPredictedValue,
        });
      } else {
        matchPrediction.totalMatches++;
        if (match.winratePredictedValue) matchPrediction.winratePredictions++;
        if (match.avgPredictedValue) matchPrediction.avgPredictions++;
      }
      await matchPrediction.save();
      await TempPredictionLast50.findOneAndDelete({ match_id });
    });
  } catch (e) {
    console.log(e);
  }
}
