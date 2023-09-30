export function prettifyScoreBasedOnResult(score, win) {
  const scores = score.split(' / ').map(Number);
  const shouldSwitch =
    (win && scores[0] < scores[1]) || (!win && scores[0] > scores[1]);

  return shouldSwitch ? `${scores[1]} / ${scores[0]}` : score;
}
