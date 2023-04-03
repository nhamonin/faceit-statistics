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
} from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';

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
    const matchPrediction = await db('match_prediction').first();
    const totalTempPredictions = await db('temp_prediction').count(
      '* as count'
    );
    const totalTeams = await db('team').count('* as count');
    const totalPlayers = await db('player').count('* as count');
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
      `Pending matches: ${getCount(totalTempPredictions)}`,
      '',
      `Total teams: ${getCount(totalTeams)}`,
      `Total players: ${getCount(totalPlayers)}`,
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

function getCount(dbCount) {
  return dbCount.length > 0 ? dbCount[0].count : 0;
}
