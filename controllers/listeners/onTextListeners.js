import { initTeam, updateTeamPlayers } from '#services';
import { mainMenuMarkup, addPlayerOnlyMarkup } from '#telegramReplyMarkup';
import {
  db,
  getBasicTelegramOptions,
  getTelegramBot,
  addNewPlayersToWebhookList,
  telegramSendMessage,
  webhookMgr,
  getPlayersByChatId,
  getCountByTableName,
} from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';
import { TELEGRAM_ADMIN_CHAT_ID } from '#config';

export function initOnTextListeners() {
  const tBot = getTelegramBot();

  tBot.onText(/\/start/, async ({ chat }) => {
    await initTeam(chat);
    const players = await getPlayersByChatId(chat.id);
    const text = players?.length ? 'welcomeBack' : 'start';
    const options = {
      players: players.map(({ nickname }) => nickname).join(', '),
    };

    await telegramSendMessage(
      chat.id,
      { text, options },
      {
        ...getBasicTelegramOptions(),
        ...(players.length ? mainMenuMarkup : addPlayerOnlyMarkup),
      }
    );
  });

  tBot.onText(/\/get_analytics/, async ({ chat, message_id }) => {
    if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
    const matchPrediction = await db('match_prediction').first();
    const totalTempPredictions = await getCountByTableName('temp_prediction');
    const totalTeams = await getCountByTableName('team');
    const totalPlayers = await getCountByTableName('player');
    const totalMatches = matchPrediction?.totalMatches || 0;
    const avgPredictions = matchPrediction?.avgPredictions || 0;
    const winratePrediction = matchPrediction?.winratePredictions || 0;
    const dataPayload = await webhookMgr.getWebhookDataPayload();
    const restrictions = dataPayload?.restrictions;
    const webhookListLength = restrictions?.length || 0;
    const text = [
      `winrate predictions: ${(
        (winratePrediction / totalMatches || 0) * 100
      ).toFixed(2)} %`,
      `avg predictions: ${((avgPredictions / totalMatches || 0) * 100).toFixed(
        2
      )} %`,
      '',
      `Total matches: ${totalMatches}`,
      `Pending matches: ${totalTempPredictions}`,
      '',
      `Total teams: ${totalTeams}`,
      `Total players: ${totalPlayers}`,
      `Webhook static list length: ${webhookListLength}`,
    ].join('\n');

    await telegramSendMessage(
      chat.id,
      { text },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(/\/delete_analytics/, async ({ chat, message_id }) => {
    if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
    await Promise.allSettled([
      db('match_prediction').delete(),
      db('temp_prediction').delete(),
    ]);

    await telegramSendMessage(
      chat.id,
      { text: 'Success! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(
    /\/add_new_wh_players.* (\S*)/,
    async ({ chat, message_id }, match) => {
      if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
      const text = await addNewPlayersToWebhookList(match[1]);

      await telegramSendMessage(
        chat.id,
        { text },
        {
          ...getBasicTelegramOptions(message_id),
        }
      );
    }
  );

  tBot.onText(/\/sync_db_with_static_list/, async ({ chat, message_id }) => {
    if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
    await syncWebhookStaticListWithDB();
    await telegramSendMessage(
      chat.id,
      { text: 'Success! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });

  tBot.onText(
    /\/limit_restrictions.* (\S*)/,
    async ({ chat, message_id }, match) => {
      if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
      await webhookMgr.limitRestrictions(+match[1]);
      await telegramSendMessage(
        chat.id,
        { text: 'Limit restrictions done! Now try /get_analytics command.' },
        {
          ...getBasicTelegramOptions(message_id),
        }
      );
    }
  );

  tBot.onText(/\/update_players/, async ({ chat, message_id }) => {
    if (chat.id !== +TELEGRAM_ADMIN_CHAT_ID) return;
    const teams = await db('team').pluck('chat_id');

    for await (const team of teams) {
      await updateTeamPlayers(team);
    }

    await telegramSendMessage(
      chat.id,
      { text: 'Update players done! Now try /get_analytics command.' },
      {
        ...getBasicTelegramOptions(message_id),
      }
    );
  });
}
