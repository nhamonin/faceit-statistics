import fetch from 'node-fetch';

import {
  ENVIRONMENT,
  FACEIT_WEBHOOK_ID,
  FACEIT_WEBHOOK_ID_TEST,
  FACEIT_WEBHOOK_API_KEY,
} from '#config';
import { getCurrentBearerToken } from '#utils';

const faceitWebhookID =
  ENVIRONMENT === 'PRODUCTION' ? FACEIT_WEBHOOK_ID : FACEIT_WEBHOOK_ID_TEST;
const url = `https://api.faceit.com/webhooks/v1/subscriptions/${faceitWebhookID}`;

function changeWebhookPlayersList(action) {
  return async function (playersIDs) {
    const webhookData = await getWebhookDataPayload();

    if (!webhookData) {
      console.log('Webhook data error, please update API key');
      return;
    }

    const body = createBodyFromWebhookData(playersIDs, action, webhookData);
    const response = await fetch(url, {
      headers: {
        ...getAuthorizationHeader(),
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body,
    });
    const result = await response.json();

    return result;
  };
}

async function getWebhookDataPayload() {
  let webhookData = await getWebhookData();

  if (!webhookData.payload) {
    const resObj = await getCurrentBearerToken();
    process.env.DYNAMIC_WEBHOOK_API_KEY = resObj?.token;
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
  console.log(process.env.DYNAMIC_WEBHOOK_API_KEY || FACEIT_WEBHOOK_API_KEY);

  return {
    Authorization: `Bearer ${
      process.env.DYNAMIC_WEBHOOK_API_KEY || FACEIT_WEBHOOK_API_KEY
    }`,
  };
}

async function fetchWebhookData() {
  return await fetch(url, {
    headers: getAuthorizationHeader(),
  });
}

export const webhookMgr = {
  addPlayersToList: changeWebhookPlayersList('add'),
  removePlayersFromList: changeWebhookPlayersList('remove'),
};
