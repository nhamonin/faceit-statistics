import { fetch } from 'undici';

import { FACEIT_WEBHOOK_ID, FACEIT_WEBHOOK_API_KEY } from '#config';
import { getCurrentBearerToken } from '#utils';

const url = `https://api.faceit.com/webhooks/v1/subscriptions/${FACEIT_WEBHOOK_ID}`;

function changeWebhookPlayersList(action) {
  return async function (playersIDs) {
    const webhookData = await getWebhookDataPayload();

    if (!webhookData) {
      console.log('Webhook data error, please update API key');
      return;
    }

    const body = createBodyFromWebhookData(playersIDs, action, webhookData);
    const res = await fetch(url, {
      headers: {
        ...getAuthorizationHeader(),
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body,
    });

    if (res.ok) return res.json();
  };
}

async function getWebhookDataPayload() {
  let webhookData = await getWebhookData();

  if (!webhookData.payload) {
    const token = await getCurrentBearerToken();
    process.env.DYNAMIC_WEBHOOK_API_KEY = token;
    webhookData = await getWebhookData();
  }

  return webhookData.payload;
}

async function getWebhookData() {
  let response = await fetchWebhookData();
  return await response.json();
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

function getAuthorizationHeader() {
  return {
    Authorization: `Bearer ${
      process.env.DYNAMIC_WEBHOOK_API_KEY || FACEIT_WEBHOOK_API_KEY
    }`,
  };
}

async function fetchWebhookData() {
  return await fetch(url, {
    headers: getAuthorizationHeader(),
    retry: 3,

    callback: (retry) => {
      console.log(`Trying: ${retry}`);
    },
  });
}

export const webhookMgr = {
  addPlayersToList: changeWebhookPlayersList('add'),
  removePlayersFromList: changeWebhookPlayersList('remove'),
};
