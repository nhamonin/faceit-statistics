export function prettifyMapPickerData(neededVariables) {
  const table = `<table cellspacing="0">
    <tr>
      <th>Map</th>
      <th>Win Rate Difference, %</th>
      <th>Impact Difference</th>
    </tr>
    ${neededVariables[1]
      .map(
        ({ mapName, totalWinrate, totalPoints }) =>
          `<tr class="${totalWinrate > 0 ? 'green' : 'red'}">
          <td>${mapName}</td>
          <td>${totalWinrate}</td>
          <td>${totalPoints}</td>
        </tr>`
      )
      .join('')}
    </table>`;

  return table;
}
