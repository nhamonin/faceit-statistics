import { calculateAverage, getPlayerMatches } from '#utils';

export async function getPlayerAvgKD(player_id, numberArr, staticVariableName) {
  const maxNumber = Math.max(...numberArr);
  const matches = await getPlayerMatches(player_id, maxNumber);
  const kdArr = matches.map(({ c2 }) => +c2);
  const res = {};

  numberArr.forEach((number) => {
    if (!staticVariableName) {
      res[`last${number}KD`] = calculateAverage(kdArr.slice(0, number));
    } else {
      res.lastKD = calculateAverage(kdArr.slice(0, number));
    }
  });

  return res;
}
