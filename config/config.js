import { config } from 'dotenv';
config();

const {
  FACEIT_API_KEY,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_API_KEY,
  TELEGRAM_API_TOKEN,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
} = process.env;

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
  resetTeam: {
    success:
      "Team has been successfully reset. Now you don't have any players. You can add some via the command '/add_player nickname.'",
    notExists:
      "You don't have a team to reset. Init it first via the command '/init_team.'",
  },
  addPlayer: {
    success: (nickname) =>
      `Player ${nickname} was added.\nCheck out Elo rating via the /get_team_elo or K/D via /get_team_kd commands.`,
    exists: (nickname) =>
      `Sorry, but player ${nickname} already exists in your team. Try to add another player.`,
    notFound: (nickname) =>
      `Sorry, but player ${nickname} doesn't exist. Try to add another player.`,
  },
  deletePlayer: {
    success: (nickname) =>
      `Player ${nickname} was deleted.\nCheck out Elo rating via the /get_team_elo or K/D via /get_team_kd commands.`,
    notExists: (nickname) =>
      `Sorry, but ${nickname} doesn't exists in your team.`,
    lastPlayerWasDeleted:
      "You just deleted the last player in your team. Please add at least one player via the '/add_player nickname' command to check the Elo rating or K/D of the team.",
  },
  updateTeamPlayers: {
    success:
      'Team players was successfully updated. Check out Elo rating via the /get_team_elo or K/D via /get_team_kd commands.',
    error:
      'Unfortunately, dut to the technical reasons it is impossible to update players right now. Please wait and try again later.',
  },
  emptyTeamError: (attribute) =>
    `Please add at least one player via '/add_player nickname' command to check ${attribute}.`,
  emptyMatchesError: 'Your teammates have no matches in CS:GO.',
  getTeamStats: (playerStatMessage, statAttribute, avgTeamStat) =>
    `${playerStatMessage}<br><br>${
      avgTeamStat ? `Avg Team ${statAttribute}: ${avgTeamStat}` : ''
    }`,
  getPlayerLastMatches: {
    notExists: (nickname) =>
      `Sorry, but ${nickname} doesn't exists in your team.`,
  },
  serverError: 'Oops, something went wrong. Try again later.',
};

const DEFAULT_MATCH_GET_LIMIT = 20;
const DEFAULT_MATCH_STORE_LIMIT = 20;

export {
  FACEIT_API_KEY,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_API_KEY,
  TELEGRAM_API_TOKEN,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  allowedCompetitionNames,
  lvlClasses,
  messages,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
};
