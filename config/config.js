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

const game_id = 'csgo';
const currentMapPool = [
  'de_ancient',
  // 'de_anubis',
  'de_dust2',
  'de_inferno',
  'de_mirage',
  'de_nuke',
  'de_overpass',
  'de_vertigo',
];

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
const matchStatusFinishedData =
  '{"transaction_id":"45377adf-37f3-43b9-93b9-e471eedba9e4","event":"match_status_ready","event_id":"7d18cfed-155b-4221-8259-3316d0b4c0b8","third_party_id":"b7b533b9-d586-419f-b6fe-3b702106a73c","app_id":"476f63e7-5bd0-489c-857b-7d8df614ec4b","timestamp":"2022-12-09T18:55:38Z","retry_count":0,"version":1,"payload":{"id":"1-d785567a-fd28-42a4-af99-6b3cec21c6a9","organizer_id":"faceit","region":"EU","game":"csgo","version":16,"entity":{"id":"42e160fc-2651-4fa5-9a9b-829199e27adb","name":"5v5 RANKED","type":"matchmaking"},"teams":[{"id":"6ed6bccc-6f1d-44c4-a9ba-c1107370d976","name":"team__deffolt","type":"","avatar":"https://distribution.faceit-cdn.net/images/8f1faec8-0c1e-4de8-b4a0-efebd8c454a6.jpeg","leader_id":"6ed6bccc-6f1d-44c4-a9ba-c1107370d976","co_leader_id":"","roster":[{"id":"6ed6bccc-6f1d-44c4-a9ba-c1107370d976","nickname":"_deffolt","avatar":"https://distribution.faceit-cdn.net/images/8f1faec8-0c1e-4de8-b4a0-efebd8c454a6.jpeg","game_id":"76561198797942411","game_name":"Esterhazi","game_skill_level":7,"membership":"","anticheat_required":true},{"id":"d4e5cc73-2754-499d-8910-b7ba6c3685fc","nickname":"m1szuXXX","avatar":"https://assets.faceit-cdn.net/avatars/d4e5cc73-2754-499d-8910-b7ba6c3685fc_1584116016682.jpg","game_id":"76561198843168153","game_name":"m1szu","game_skill_level":7,"membership":"","anticheat_required":true},{"id":"58fc1c34-d1cd-4a87-9bf3-ec1857709f6b","nickname":"DragoMag","avatar":"https://assets.faceit-cdn.net/avatars/58fc1c34-d1cd-4a87-9bf3-ec1857709f6b_1612094707144.jpg","game_id":"76561198103535278","game_name":"DiFFi","game_skill_level":8,"membership":"","anticheat_required":true},{"id":"b7b533b9-d586-419f-b6fe-3b702106a73c","nickname":"stolbn","avatar":"https://assets.faceit-cdn.net/avatars/b7b533b9-d586-419f-b6fe-3b702106a73c_1631907362574.jpg","game_id":"76561198338897039","game_name":"stolbn","game_skill_level":5,"membership":"","anticheat_required":true},{"id":"8961f0be-54ef-4815-9f05-87a95c13b47c","nickname":"EDY9814","avatar":"https://assets.faceit-cdn.net/avatars/8961f0be-54ef-4815-9f05-87a95c13b47c_1609292706323.jpg","game_id":"76561198152169819","game_name":"edi","game_skill_level":7,"membership":"","anticheat_required":true}],"substitutions":0,"substitutes":null},{"id":"a075e3a5-afc7-4ee4-9cc7-ccb2fe8b1e7d","name":"team_Ragged-","type":"","avatar":"https://distribution.faceit-cdn.net/images/73ff9bd1-aa7a-486a-bdc5-018ecd902670.jpeg","leader_id":"a075e3a5-afc7-4ee4-9cc7-ccb2fe8b1e7d","co_leader_id":"","roster":[{"id":"a075e3a5-afc7-4ee4-9cc7-ccb2fe8b1e7d","nickname":"Ragged-","avatar":"https://distribution.faceit-cdn.net/images/73ff9bd1-aa7a-486a-bdc5-018ecd902670.jpeg","game_id":"76561198042760180","game_name":"wack","game_skill_level":7,"membership":"","anticheat_required":true},{"id":"c2096453-e487-4eaf-822a-9fd46796d657","nickname":"F33LB55D","avatar":"https://distribution.faceit-cdn.net/images/e27195b3-6104-4c8b-8d49-93262ada95a9.jpeg","game_id":"76561198027488865","game_name":"Broken whiskey glass","game_skill_level":7,"membership":"","anticheat_required":true},{"id":"284091f7-2e87-449a-9190-afc5a21f862a","nickname":"Dimishaaaa","avatar":"https://distribution.faceit-cdn.net/images/3bcee073-4e47-4d72-93b5-bdc5ad5692ed.jpeg","game_id":"76561198995231014","game_name":"Dimisha","game_skill_level":8,"membership":"","anticheat_required":true},{"id":"dc5427a4-e279-4f69-94e9-383bbc8ebcba","nickname":"_Huntress","avatar":"https://assets.faceit-cdn.net/avatars/dc5427a4-e279-4f69-94e9-383bbc8ebcba_1550612193861.jpg","game_id":"76561198159088923","game_name":"Huntress","game_skill_level":6,"membership":"","anticheat_required":true},{"id":"5dbc3ca1-baf4-4a5a-992d-a22486fc2505","nickname":"djans","avatar":"","game_id":"76561198861673752","game_name":"djans","game_skill_level":7,"membership":"","anticheat_required":true}],"substitutions":0,"substitutes":null}],"created_at":"2022-12-09T18:54:23Z","updated_at":"2022-12-09T18:55:37Z"}}';
const allowedTeamsToGetMapPickerNotifications = [146612362, 392067613];

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
  game_id,
  currentMapPool,
  allowedCompetitionNames,
  lvlClasses,
  messages,
  DEFAULT_MATCH_GET_LIMIT,
  DEFAULT_MATCH_STORE_LIMIT,
  MAX_PLAYERS_AMOUNT,
  bots,
  matchStatusFinishedData,
  allowedTeamsToGetMapPickerNotifications,
};
