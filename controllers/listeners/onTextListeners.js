import {
  initTeam,
  updateTeamPlayers,
  addNewPlayersToWebhookList,
  getAnalytics,
  deleteAnalytics,
} from '#services';
import { mainMenuMarkup, addPlayerOnlyMarkup } from '#telegramReplyMarkup';
import {
  db,
  getBasicTelegramOptions,
  getTelegramBot,
  telegramSendMessage,
  getPlayersByChatId,
  isAdminChat,
  webhookMgr,
} from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';

export function initOnTextListeners() {
  const tBot = getTelegramBot();

  tBot.onText(/\/start/, handleStartCommand);
  tBot.onText(/\/get_analytics/, handleGetAnalyticsCommand);
  tBot.onText(/\/delete_analytics/, handleDeleteAnalyticsCommand);
  tBot.onText(/\/add_new_wh_players.* (\S*)/, handleAddNewWhPlayersCommand);
  tBot.onText(/\/sync_db_with_static_list/, handleSyncDbWithStaticListCommand);
  tBot.onText(/\/limit_restrictions.* (\S*)/, handleLimitRestrictionsCommand);
  tBot.onText(/\/update_players/, handleUpdatePlayersCommand);
}

async function handleStartCommand({ chat }) {
  await initTeam(chat);
  const players = await getPlayersByChatId(chat.id);
  const text = players?.length ? 'welcomeBack' : 'start';
  const options = {
    players: players.map(({ nickname }) => nickname).join(', '),
  };
  const markup = players.length ? mainMenuMarkup : addPlayerOnlyMarkup;

  await sendTelegramMessage(chat.id, text, options, markup);
}

async function handleGetAnalyticsCommand({ chat, message_id }) {
  if (!isAdminChat(chat.id)) return;
  const text = await getAnalytics();
  await sendTelegramMessage(chat.id, text, {}, message_id);
}

async function handleDeleteAnalyticsCommand({ chat, message_id }) {
  if (!isAdminChat(chat.id)) return;
  await deleteAnalytics();
  await sendTelegramMessage(
    chat.id,
    'Deletion of analytics done! Now try /get_analytics command.',
    {},
    message_id
  );
}

async function handleAddNewWhPlayersCommand({ chat, message_id }, match) {
  if (!isAdminChat(chat.id)) return;
  const text = await addNewPlayersToWebhookList(match[1]);
  await sendTelegramMessage(chat.id, text, {}, message_id);
}

async function handleSyncDbWithStaticListCommand({ chat, message_id }) {
  if (!isAdminChat(chat.id)) return;
  await syncWebhookStaticListWithDB();
  await sendTelegramMessage(
    chat.id,
    'Sync DB with static list done! Now try /get_analytics command.',
    {},
    message_id
  );
}

async function handleLimitRestrictionsCommand({ chat, message_id }, match) {
  if (!isAdminChat(chat.id)) return;
  await webhookMgr.limitRestrictions(+match[1]);
  await sendTelegramMessage(
    chat.id,
    'Limit restrictions done! Now try /get_analytics command.',
    {},
    message_id
  );
}

async function handleUpdatePlayersCommand({ chat, message_id }) {
  if (!isAdminChat(chat.id)) return;
  const teams = await db('team').pluck('chat_id');

  for await (const team of teams) {
    await updateTeamPlayers(team);
  }

  await sendTelegramMessage(
    chat.id,
    'Update players done! Now try /get_analytics command.',
    {},
    message_id
  );
}

async function sendTelegramMessage(
  chatId,
  text,
  options = {},
  replyMarkup = {},
  messageId = undefined
) {
  const sendMessageOptions = {
    ...getBasicTelegramOptions(messageId),
    ...replyMarkup,
  };
  await telegramSendMessage(chatId, { text, options }, sendMessageOptions);
}
