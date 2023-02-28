import { config } from 'dotenv';
config();

const {
  ENVIRONMENT,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID_PROD,
  FACEIT_WEBHOOK_ID_TEST,
  FACEIT_WEBHOOK_API_KEY,
  TELEGRAM_BOT_API_TOKEN_PROD,
  TELEGRAM_BOT_API_TOKEN_TEST,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME_PROD,
  MONGO_DB_CLUSTER_NAME_TEST,
  COOKIES_LOGGED_IN_NAME,
  COOKIES_LOGGED_IN_VALUE,
} = process.env;

const isProduction = ENVIRONMENT === 'PRODUCTION';
const TELEGRAM_BOT_API_TOKEN = isProduction
  ? TELEGRAM_BOT_API_TOKEN_PROD
  : TELEGRAM_BOT_API_TOKEN_TEST;
const MONGO_DB_CLUSTER_NAME = isProduction
  ? MONGO_DB_CLUSTER_NAME_PROD
  : MONGO_DB_CLUSTER_NAME_TEST;
const FACEIT_WEBHOOK_ID = isProduction
  ? FACEIT_WEBHOOK_ID_PROD
  : FACEIT_WEBHOOK_ID_TEST;
const host = isProduction ? '185.166.216.70' : '127.0.0.1';
const port = isProduction ? 443 : 8000;
const game_id = 'csgo';
const currentMapPool = [
  'de_ancient',
  'de_dust2',
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
const DEFAULT_MATCH_GET_LIMIT = 20;
const DEFAULT_MATCH_STORE_LIMIT = 20;
const MAX_PLAYERS_AMOUNT = 7;
const MAX_MATCHES_PER_REQUEST = 2000;
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
  updateTeamPlayers: new Set(),
  bestMapsMatchIDs: new Set(),
  bestMapsMatchIDsLast50: new Set(),
};
const loggedInCookie = {
  name: COOKIES_LOGGED_IN_NAME,
  value: COOKIES_LOGGED_IN_VALUE,
};

export {
  isProduction,
  host,
  port,
  ENVIRONMENT,
  TELEGRAM_BOT_API_TOKEN,
  FACEIT_API_KEY,
  FACEIT_APP_ID,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_API_KEY,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  loggedInCookie,
  game_id,
  currentMapPool,
  allowedCompetitionNames,
  lvlClasses,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
  MAX_PLAYERS_AMOUNT,
  MAX_MATCHES_PER_REQUEST,
  bots,
  puppeteerArgs,
  caches,
};
