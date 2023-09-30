export function getTeamNicknames(players) {
  return players?.map(({ nickname }) => nickname) || [];
}
