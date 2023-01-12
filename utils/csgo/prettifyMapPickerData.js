export function prettifyMapPickerData(neededVariables) {
  const table = `<table cellspacing="0">
    <tr>
      <th>Map</th>
      <th>Impact Difference</th>
      <th>Win Rate Difference, %</th>
    </tr>
    ${neededVariables[1]
      .map(
        ({ mapName, totalWinrate, totalPoints }) =>
          `<tr class="${totalPoints > 0 ? 'green' : 'red'}">
          <td>${mapName}</td>
          <td>${totalPoints}</td>
          <td>${totalWinrate}</td>
        </tr>`
      )
      .join('')}
    </table>`;

  return table;
}
