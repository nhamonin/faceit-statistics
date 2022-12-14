export function getTeamNicknames(team) {
  return team.players.map(({ nickname }) => nickname);
}
