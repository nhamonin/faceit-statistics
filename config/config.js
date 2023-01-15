import { config } from 'dotenv';
config();

const {
  ENVIRONMENT,
  FACEIT_EMAIL,
  FACEIT_PASSWORD,
  FACEIT_API_KEY_1,
  FACEIT_API_KEY_2,
  FACEIT_API_KEY_3,
  FACEIT_API_KEY_4,
  FACEIT_API_KEY_5,
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
  COOKIES_LOGGED_IN_NAME,
  COOKIES_LOGGED_IN_VALUE,
} = process.env;

const game_id = 'csgo';
const currentMapPool = [
  'de_ancient',
  'de_dust2',
  'de_inferno',
  'de_mirage',
  'de_nuke',
  'de_overpass',
  'de_vertigo',
  // 'de_anubis',
];

const allowedCompetitionNames = [
  '5v5 RANKED',
  '5v5 RANKED PREMIUM',
  'CS:GO 5v5',
];
const lvlClasses = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
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
    `${playerStatMessage}<br>${
      avgTeamStat ? `<div>Avg Team ${statAttribute}: ${avgTeamStat}</div>` : ''
    }`,
  getPlayerLastMatches: {
    notExists: (nickname) =>
      `Sorry, but player with nickname <b>${nickname}</b> doesn't exists. Try to check another player.`,
  },
  getTeamKD: {
    validationError:
      'Bad value error: Your input must be an integer number greater than 0.',
  },
  teamNotExistError:
    "You don't have a team. Init it first via the command '/start.'",
  serverError: 'Oops, something went wrong. Try again later.',
};

const DEFAULT_MATCH_GET_LIMIT = 20;
const DEFAULT_MATCH_STORE_LIMIT = 20;
const MAX_PLAYERS_AMOUNT = 7;
const bots = {};
const allowedTeamsToGetMapPickerNotifications = [146612362, 392067613];
const puppeteerArgs = [
  '--disable-gpu',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
];
const FACEIT_API_KEYS = [
  FACEIT_API_KEY_1,
  FACEIT_API_KEY_2,
  FACEIT_API_KEY_3,
  FACEIT_API_KEY_4,
  FACEIT_API_KEY_5,
];
const caches = {
  updateTeamPlayers: new Set(),
  bestMapsMatchIDs: new Set(),
};
const loggedInCookie = {
  name: COOKIES_LOGGED_IN_NAME,
  value: COOKIES_LOGGED_IN_VALUE,
};

export {
  ENVIRONMENT,
  FACEIT_EMAIL,
  FACEIT_PASSWORD,
  FACEIT_API_KEYS,
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
  loggedInCookie,
  game_id,
  currentMapPool,
  allowedCompetitionNames,
  lvlClasses,
  messages,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
  MAX_PLAYERS_AMOUNT,
  bots,
  allowedTeamsToGetMapPickerNotifications,
  puppeteerArgs,
  caches,
};
