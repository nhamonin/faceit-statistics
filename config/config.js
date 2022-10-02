const allowedCompetitionNames = [
  '5v5 RANKED',
  '5v5 RANKED PREMIUM',
  'CS:GO 5v5',
];

const lvlClasses = {
  1: 'white',
  2: 'green',
  3: 'green',
  4: 'yellow',
  5: 'yellow',
  6: 'yellow',
  7: 'yellow',
  8: 'orange',
  9: 'orange',
  10: 'red',
};

const messages = {
  start:
    "Welcome to the faceit stats bot! You are now able to add players to your list. Please do it via the command '/add_player nickname.'",
  addPlayer: {
    success: (nickname) =>
      `Player ${nickname} was added.\nCheck out elo via /get_team_elo or K/D via /get_team_kd commands.`,
    exists: (nickname) =>
      `Sorry, but ${nickname} already exists in your team. Try to add another player.`,
  },
  deletePlayer: {
    success: (nickname) =>
      `Player ${nickname} was deleted.\nCheck out elo via /get_team_elo or K/D via /get_team_kd commands.`,
    notExists: (nickname) =>
      `Sorry, but ${nickname} doesn't exists in your team.`,
  },
  emptyTeamError: (attribute) =>
    `Please add at least one player via '/add_player nickname' command to check ${attribute}.`,
  emptyMatchesError: 'Your teammates have no matches in CS:GO.',
  getTeamStats: (playerStatMessage, statAttribute, avgTeamStat) =>
    `${playerStatMessage}<br><br>Avg Team ${statAttribute}: ${avgTeamStat}`,
};

const DEFAULT_MATCH_LIMIT = 20;

export { allowedCompetitionNames, lvlClasses, messages, DEFAULT_MATCH_LIMIT };
