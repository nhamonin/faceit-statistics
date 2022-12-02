import fetch from 'node-fetch';

import {
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_API_KEY,
} from '../../config/config.js';

const url = `https://api.faceit.com/webhooks/v1/subscriptions/${FACEIT_WEBHOOK_ID}`;
const authorizationHeader = {
  Authorization: `Bearer ${FACEIT_WEBHOOK_API_KEY}`,
};

function changeWebhookPlayersList(action) {
  return async function (playersIDs) {
    const webhookData = await getWebhookData();

    if (!webhookData) {
      console.log('Webhook data error, please update API key');
      return;
    }

    const body = createBodyFromWebhookData(playersIDs, action, webhookData);
    const response = await fetch(url, {
      headers: {
        ...authorizationHeader,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body,
    });
    const result = await response.json();

    return result;
  };
}

async function getWebhookData() {
  const response = await fetch(url, {
    headers: authorizationHeader,
  });
  const webhookData = await response.json();

  return webhookData.payload;
}

function createBodyFromWebhookData(playersIDs, action, webhookData) {
  let body = {
    active: webhookData.active,
    name: webhookData.name,
    public: webhookData.public,
    type: webhookData.type,
    events: webhookData.events,
    url: webhookData.url,
    tokens: webhookData.tokens,
    app_id: webhookData.app_id,
  };
  let restrictions = webhookData.restrictions;

  label: if (action === 'add') {
    const isPlayerAlreadyInList = restrictions.some(({ value }) =>
      playersIDs.includes(value)
    );

    if (isPlayerAlreadyInList) break label;

    restrictions = [
      ...restrictions,
      ...playersIDs.map((player_id) => ({
        type: 'user',
        value: player_id,
      })),
    ];
  } else if (action === 'remove') {
    restrictions = restrictions.filter(
      ({ value }) => !playersIDs.includes(value)
    );
  }

  return JSON.stringify({ ...body, restrictions });
}

export const webhookMgr = {
  addPlayersToList: changeWebhookPlayersList('add'),
  removePlayersFromList: changeWebhookPlayersList('remove'),
};
