export function prettifyMapPickerData(neededVariables) {
  const playersString = neededVariables[0]
    .map(({ nickname }) => nickname)
    .join(', ');

  return [
    `Best maps for: ${playersString}:`,
    '',
    ...neededVariables[1].map(
      ({ mapName, totalWinrate, totalPoints }) =>
        `${mapName} | ${totalWinrate}%* (${totalPoints})**`
    ),
    '',
    '* - difference between winrates',
    '** - difference between impacts',
  ].join('\n');
}
