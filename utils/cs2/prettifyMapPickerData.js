export function prettifyMapPickerData(neededVariables) {
  const getClassForPoints = (totalPoints) => {
    if (totalPoints > 0) {
      return 'green';
    } else if (Math.abs(totalPoints) < 20) {
      return 'yellow';
    } else {
      return 'red';
    }
  };

  const createRow = ({ mapName, totalWinrate, totalPoints }) => {
    const rowClass = getClassForPoints(totalPoints);
    return `
      <tr class="${rowClass}">
        <td>${mapName}</td>
        <td>${totalPoints}</td>
        <td>${totalWinrate}</td>
      </tr>
    `;
  };

  const tableRows = neededVariables[1].map(createRow).join('');

  const table = `
    <table cellspacing="0">
      <tr>
        <th>Map</th>
        <th>Impact Difference</th>
        <th>Win Rate Difference, %</th>
      </tr>
      ${tableRows}
    </table>
  `;

  return table;
}
