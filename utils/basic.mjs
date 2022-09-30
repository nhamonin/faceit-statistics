function calculateAverage(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function isPlayerTeamMember(players, name) {
  return players.some(({ nickname }) => nickname === name);
}

export { calculateAverage, isPlayerTeamMember };
