export function getCurrentWinrate(matches, type) {
  const correctlyPredictedValues = matches.filter(
    (match) => match[(type === 'avg' ? 'avg' : 'winrate') + 'PredictedValue']
  ).length;
  return (correctlyPredictedValues / matches.length) * 100;
}
