import { Matches } from 'faceit-node-api';

import { Match, MatchPrediction, TempPrediction } from '#models';
import { currentMapPool } from '#config';

export async function performMapPickerAnalytics(match_id) {
  try {
    const tempPrediction = await TempPrediction.findOne({ match_id });
    if (!tempPrediction) return;
    const { predictions } = tempPrediction;
    if (!predictions) return;
    const matches = new Matches();
    const matchData = await matches.getMatchDetails(match_id);
    const winner = matchData?.results?.winner;
    const pickedMap = matchData?.voting?.map?.pick[0];
    if (!pickedMap && !winner && !currentMapPool.includes(pickedMap)) return;
    const predictedDataTeam = predictions[winner === 'faction1' ? 0 : 1];
    if (!predictedDataTeam) return;
    const predictedDataMap = predictedDataTeam.filter(
      (predictionObj) => predictionObj.mapName === pickedMap
    )[0];
    if (!predictedDataMap) return;
    const match = new Match({
      match_id,
      winratePredictedValue: predictedDataMap.totalWinrate > 0,
      avgPredictedValue: predictedDataMap.totalPoints > 0,
    });
    let matchPrediction = await MatchPrediction.findOne();
    match.save().then(async () => {
      if (!matchPrediction) {
        matchPrediction = new MatchPrediction({
          matches: [match],
        });
      } else {
        let matchesAmount = matchPrediction.matches.length;
        let avgPredictWinrateMatchesAmount =
          (matchesAmount *
            matchPrediction.avgMatchesPrediction.currentWinrate) /
          100;
        let winPredictWinrateMatchesAmount =
          (matchesAmount *
            matchPrediction.winrateMatchesPrediction.currentWinrate) /
          100;

        matchPrediction.matches?.push(match);
        if (match.winratePredictedValue) winPredictWinrateMatchesAmount++;
        if (match.avgMatchesPrediction) avgPredictWinrateMatchesAmount++;
        matchesAmount++;
        matchPrediction.avgMatchesPrediction = {
          currentWinrate:
            (avgPredictWinrateMatchesAmount / matchesAmount) * 100,
        };
        matchPrediction.winrateMatchesPrediction = {
          currentWinrate:
            (winPredictWinrateMatchesAmount / matchesAmount) * 100,
        };
        await matchPrediction.save();
      }
      await matchPrediction.save();
      await TempPrediction.findOneAndDelete({ match_id });
    });
  } catch (e) {
    console.log(e);
  }
}
