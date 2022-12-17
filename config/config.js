import { config } from 'dotenv';
config();

const {
  ENVIRONMENT,
  FACEIT_EMAIL,
  FACEIT_PASSWORD,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_ID_TEST,
  FACEIT_WEBHOOK_API_KEY,
  HCAPTCHA_API_KEY,
  TELEGRAM_API_TOKEN,
  TELEGRAM_API_TOKEN_TEST,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  MONGO_DB_CLUSTER_NAME_TEST,
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
  start: (players) =>
    players.length
      ? `Welcome back!
Your team: <b>${players.join(', ')}</b>.
You can check stats or modify your team.`
      : 'Welcome to the faceit stats bot! You are now able to add players to your list.',
  resetTeam: {
    success:
      "Team has been successfully reset. Now you don't have any players. You can add some via the button below.",
    notExists:
      "You don't have a team to reset. Init it first via the command '/start.'",
  },
  addPlayer: {
    success: (nickname, teamNicknames) =>
      `Player <b>${nickname}</b> was added.\nYour team: <b>${teamNicknames}</b>.`,
    exists: (nickname, teamNicknames) =>
      `Sorry, but player <b>${nickname}</b> already exists in your team. Try to add another player.\nYour team: <b>${teamNicknames}</b>.`,
    notFound: (nickname, teamNicknames) =>
      `Sorry, but player <b>${nickname}</b> doesn't exist. Try to add another player.\nYour team: <b>${teamNicknames}</b>.`,
    tooMany: (teamNicknames) =>
      `Sorry, but you can't add more players. Try to delete the existing one to add a new one.\nYour team: <b>${teamNicknames}</b>.`,
  },
  deletePlayer: {
    success: (nickname, teamNicknames) =>
      `Player <b>${nickname}</b> was deleted.\nYour team: <b>${teamNicknames}</b>.`,
    notExists: (nickname) =>
      `Sorry, but <b>${nickname}</b> doesn't exists in your team.`,
    lastPlayerWasDeleted:
      'You just deleted the last player in your team. Please add at least one player via the button below',
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
      `Sorry, but player with nickname <b>${nickname}</b> doesn't exists. Try to check another player.`,
  },
  teamNotExistError:
    "You don't have a team. Init it first via the command '/start.'",
  serverError: 'Oops, something went wrong. Try again later.',
};

const DEFAULT_MATCH_GET_LIMIT = 20;
const DEFAULT_MATCH_STORE_LIMIT = 20;
const MAX_PLAYERS_AMOUNT = 7;
const bots = {};

export {
  ENVIRONMENT,
  FACEIT_EMAIL,
  FACEIT_PASSWORD,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_ID_TEST,
  FACEIT_WEBHOOK_API_KEY,
  HCAPTCHA_API_KEY,
  TELEGRAM_API_TOKEN,
  TELEGRAM_API_TOKEN_TEST,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  MONGO_DB_CLUSTER_NAME_TEST,
  allowedCompetitionNames,
  lvlClasses,
  messages,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
  MAX_PLAYERS_AMOUNT,
  bots,
};
