import { config } from 'dotenv';
config();

const {
  ENVIRONMENT,
  HOST_PROD,
  HOST_TEST,
  PORT_PROD,
  PORT_TEST,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID_PROD,
  FACEIT_WEBHOOK_ID_TEST,
  FACEIT_WEBHOOK_API_KEY,
  TELEGRAM_BOT_API_TOKEN_PROD,
  TELEGRAM_BOT_API_TOKEN_TEST,
  TELEGRAM_ADMIN_CHAT_ID,
  TELEGRAM_LOGS_CHAT_ID,
  TELEGRAM_BACKUPS_CHAT_ID,
  PG_CONNECTION_STRING_PROD,
  PG_CONNECTION_STRING_TEST,
  COOKIES_LOGGED_IN_NAME,
  COOKIES_LOGGED_IN_VALUE,
} = process.env;

const isProduction = ENVIRONMENT === 'PRODUCTION';
const TELEGRAM_BOT_API_TOKEN = isProduction
  ? TELEGRAM_BOT_API_TOKEN_PROD
  : TELEGRAM_BOT_API_TOKEN_TEST;
const PG_CONNECTION_STRING = isProduction ? PG_CONNECTION_STRING_PROD : PG_CONNECTION_STRING_TEST;
const FACEIT_WEBHOOK_ID = isProduction ? FACEIT_WEBHOOK_ID_PROD : FACEIT_WEBHOOK_ID_TEST;
const host = isProduction ? HOST_PROD : HOST_TEST;
const port = isProduction ? PORT_PROD : PORT_TEST;
const SERVER_URL = `https://${host}:${port}`;
const game_id = 'cs2';
const currentMapPool = [
  'de_ancient',
  'de_inferno',
  'de_mirage',
  'de_nuke',
  'de_overpass',
  'de_vertigo',
  'de_anubis',
];
const allowedCompetitionNames = [
  '5v5 RANKED',
  '5v5 RANKED PREMIUM',
  'COMPETITIVE 5v5',
  'COMPETITIVE 5V5',
  'CS2 5v5',
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
const faceitLevels = {
  1: [0, 500],
  2: [501, 750],
  3: [751, 900],
  4: [901, 1050],
  5: [1051, 1200],
  6: [1201, 1350],
  7: [1351, 1530],
  8: [1531, 1750],
  9: [1751, 2000],
  10: [2001, Infinity],
};
const DEFAULT_MATCH_GET_LIMIT = 20;
const DEFAULT_MATCH_STORE_LIMIT = 20;
const MAX_PLAYERS_AMOUNT = 10;
const MAX_MATCHES_PER_REQUEST = 100;
const bots = {};
const puppeteerArgs = [
  '--disable-gpu',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
];
const caches = {
  updatedPlayers: new Set(),
  bestMapsMatchIDs: new Set(),
  summaryStatsMatchIDs: new Set(),
  match_object_created: new Set(),
  match_status_finished: new Set(),
  match_status_ready: new Set(),
  match_status_configuring: new Set(),
};
const loggedInCookie = {
  name: COOKIES_LOGGED_IN_NAME,
  value: COOKIES_LOGGED_IN_VALUE,
};
const ERROR_TELEGRAM_FORBIDDEN = 'ETELEGRAM: 403 Forbidden:';
const statsNumberArray = [10, 20, 50];
const eventEmitter = {
  main: null,
};
const COMMAND_PATTERNS = {
  start: /^\/start$/,
  getAnalytics: /^\/get_analytics$/,
  deleteAnalytics: /^\/delete_analytics$/,
  addNewWhPlayers: /^\/add_new_wh_players\s+(\S+)\s+(\d+)$/,
  syncDbWithStaticList: /^\/sync_db_with_static_list$/,
  limitRestrictions: /^\/limit_restrictions\s*(\S*)$/,
  softUpdatePlayers: /^\/soft_update_players$/,
  updatePlayers: /^\/update_players$/,
  hardUpdatePlayers: /^\/hard_update_players$/,
  updateWebhookToken: /^\/update_webhook_token\s*(\S*)$/,
};
const dynamicValues = {
  FACEIT_WEBHOOK_API_KEY,
};
const MATCHES_FETCH_DELAY = 1250;
const TELEGRAM_MESSAGE_UPDATE_DELAY = 1750;
const mimeTypes = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export {
  isProduction,
  host,
  port,
  SERVER_URL,
  ENVIRONMENT,
  TELEGRAM_BOT_API_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID,
  TELEGRAM_LOGS_CHAT_ID,
  TELEGRAM_BACKUPS_CHAT_ID,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  PG_CONNECTION_STRING,
  dynamicValues,
  loggedInCookie,
  game_id,
  currentMapPool,
  allowedCompetitionNames,
  lvlClasses,
  faceitLevels,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
  MAX_PLAYERS_AMOUNT,
  MAX_MATCHES_PER_REQUEST,
  bots,
  puppeteerArgs,
  caches,
  ERROR_TELEGRAM_FORBIDDEN,
  statsNumberArray,
  eventEmitter,
  COMMAND_PATTERNS,
  MATCHES_FETCH_DELAY,
  TELEGRAM_MESSAGE_UPDATE_DELAY,
  mimeTypes,
};
