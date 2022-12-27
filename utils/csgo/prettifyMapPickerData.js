export function prettifyMapPickerData(neededVariables, basedOn) {
  return [
    `Best maps based on ${basedOn} for: ` +
      neededVariables[0].map(({ nickname }) => nickname).join(', ') +
      ':',
    '',
    ...neededVariables[1].map(
      ({ mapName, totalWinrate, totalMatches, totalPoints }) =>
        totalWinrate && totalMatches
          ? `${mapName} | ${totalWinrate}% | ${totalMatches}`
          : `${mapName} | ${totalPoints}`
    ),
  ].join('\n');
}
