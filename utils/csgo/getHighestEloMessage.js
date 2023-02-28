import strings from '#strings';

export function getHighestEloMessage(
  playerNickname,
  highestElo,
  highestEloDate,
  diffElo,
  diffDays
) {
  return diffElo < 0
    ? strings.highestElo.defaultMessage(
        playerNickname,
        highestElo,
        diffElo,
        highestEloDate,
        diffDays
      )
    : strings.highestElo.peakEloMessage(
        playerNickname,
        highestElo,
        highestEloDate,
        diffDays
      );
}
