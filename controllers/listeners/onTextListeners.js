import database from '#db';
import {
  initTeam,
  updateTeamPlayers,
  addNewPlayersToWebhookList,
  getAnalytics,
  deleteAnalytics,
} from '#services';
import { mainMenuMarkup, addPlayerOnlyMarkup } from '#telegramReplyMarkup';
import {
  getBasicTelegramOptions,
  getTelegramBot,
  telegramSendMessage,
  withAdminChat,
  webhookMgr,
} from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';
import { COMMAND_PATTERNS } from '#config';

export function initOnTextListeners() {
  registerCommand(COMMAND_PATTERNS.start, handleStartCommand);
  registerCommand(
    COMMAND_PATTERNS.getAnalytics,
    handleGetAnalyticsCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.deleteAnalytics,
    handleDeleteAnalyticsCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.addNewWhPlayers,
    handleAddNewWhPlayersCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.syncDbWithStaticList,
    handleSyncDbWithStaticListCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.limitRestrictions,
    handleLimitRestrictionsCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.updatePlayers,
    handleUpdatePlayersCommand,
    true
  );
  registerCommand(
    COMMAND_PATTERNS.hardUpdatePlayers,
    handleHardUpdatePlayersCommand,
    true
  );
}

async function handleStartCommand({ chat }) {
  await initTeam(chat);
  const players = await database.players.readAllByChatId(chat.id);
  const text = players?.length ? 'welcomeBack' : 'start';
  const options = {
    players: players.map(({ nickname }) => nickname).join(', '),
  };
  const replyMarkup = players.length ? mainMenuMarkup : addPlayerOnlyMarkup;

  await sendTelegramMessage({
    chatId: chat.id,
    text,
    options,
    replyMarkup,
  });
}

async function handleGetAnalyticsCommand({ chat, message_id }) {
  const text = await getAnalytics();

  await sendTelegramMessage({
    chatId: chat.id,
    text,
    messageId: message_id,
  });
}

async function handleDeleteAnalyticsCommand({ chat, message_id }) {
  await deleteAnalytics();
  await sendTelegramMessage({
    chatId: chat.id,
    text: 'Deletion of analytics done! Now try /get_analytics command.',
    messageId: message_id,
  });
}

async function handleAddNewWhPlayersCommand({ chat, message_id }, match) {
  const text = await addNewPlayersToWebhookList(match[1]);
  await sendTelegramMessage({
    chatId: chat.id,
    text,
    messageId: message_id,
  });
}

async function handleSyncDbWithStaticListCommand({ chat, message_id }) {
  await syncWebhookStaticListWithDB();
  await sendTelegramMessage({
    chatId: chat.id,
    text: 'Sync DB with static list done! Now try /get_analytics command.',
    messageId: message_id,
  });
}

async function handleLimitRestrictionsCommand({ chat, message_id }, match) {
  await webhookMgr.limitRestrictions(+match[1]);
  await sendTelegramMessage({
    chatId: chat.id,
    text: 'Limit restrictions done! Now try /get_analytics command.',
    messageId: message_id,
  });
}

async function handleUpdatePlayersCommand({ chat, message_id }) {
  const teamIDs = await database.teams.readAllChatIds();

  for await (const team of teamIDs) {
    await updateTeamPlayers(team);
  }

  await sendTelegramMessage({
    chatId: chat.id,
    text: 'Update players done! Now try /get_analytics command.',
    messageId: message_id,
  });
}

async function handleHardUpdatePlayersCommand({ chat, message_id }) {
  const teamIDs = await database.teams.readAllChatIds();

  for await (const team of teamIDs) {
    await updateTeamPlayers(team, true);
  }

  await sendTelegramMessage({
    chatId: chat.id,
    text: 'Hard update players done! Now try /get_analytics command.',
    messageId: message_id,
  });
}

async function sendTelegramMessage({
  chatId,
  text,
  options = {},
  replyMarkup = {},
  messageId = undefined,
}) {
  const sendMessageOptions = {
    ...getBasicTelegramOptions(messageId),
    ...replyMarkup,
  };
  await telegramSendMessage(chatId, { text, options }, sendMessageOptions);
}

function registerCommand(pattern, handler, adminOnly = false) {
  const tBot = getTelegramBot();
  const commandHandler = (msg, match) => {
    handler(msg, match);
  };

  if (adminOnly) {
    tBot.onText(pattern, withAdminChat(commandHandler));
  } else {
    tBot.onText(pattern, commandHandler);
  }
}
