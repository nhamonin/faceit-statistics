import { Matches } from 'faceit-node-api';

import { Match, MatchPrediction, TempPrediction } from '#models';
import { getCurrentWinrate } from '#utils';
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
    match.save().then(async () => {
      let matchPrediction = await MatchPrediction.findOne();
      if (!matchPrediction) {
        matchPrediction = new MatchPrediction({
          matches: [match],
        });
        matchPrediction.avgMatchesPrediction = {
          currentWinrate: getCurrentWinrate([match], 'avg'),
        };
        matchPrediction.winrateMatchesPrediction = {
          currentWinrate: getCurrentWinrate([match], 'winrate'),
        };
      } else {
        matchPrediction.matches?.push(match);
        const { matches } = await matchPrediction.populate('matches');
        matchPrediction.avgMatchesPrediction = {
          currentWinrate: getCurrentWinrate(matches, 'avg'),
        };
        matchPrediction.winrateMatchesPrediction = {
          currentWinrate: getCurrentWinrate(matches, 'winrate'),
        };
      }
      await matchPrediction.save();
      await TempPrediction.findOneAndDelete({ match_id });
    });
  } catch (e) {
    console.log(e);
  }
}
