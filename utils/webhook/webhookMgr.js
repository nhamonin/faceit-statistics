import { FACEIT_WEBHOOK_ID, dynamicValues } from '#config';
import { getCurrentBearerToken, setEnvValue, withErrorHandling, fetchData } from '#utils';
import { syncWebhookStaticListWithDB } from '#jobs';

const url = `https://api.faceit.com/webhooks/v1/subscriptions/${FACEIT_WEBHOOK_ID}`;

function changeWebhookPlayersList(action) {
  return withErrorHandling(
    async (playersIDs) => {
      const webhookData = await getWebhookDataPayload();

      if (!webhookData) {
        console.error('Webhook data error, please update API key');
        return;
      }

      const body = createBodyFromWebhookData(playersIDs, action, webhookData);
      const res = await fetchData(url, {
        headers: {
          ...getAuthorizationHeader(),
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body,
        retries: 3,
        delay: 1000,
      });

      return res;
    },
    {
      error: 'FetchError',
      errorMessage: 'Unable to change webhook players list.',
    }
  );
}

async function getWebhookDataPayload() {
  let webhookData = await getWebhookData();

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
    const isPlayerAlreadyInList = restrictions.some(({ value }) => playersIDs.includes(value));

    if (isPlayerAlreadyInList) break label;

    restrictions = [
      ...restrictions,
      ...playersIDs.map((player_id) => ({
        type: 'user',
        value: player_id,
      })),
    ];
  } else if (action === 'remove') {
    restrictions = restrictions.filter(({ value }) => !playersIDs.includes(value));
  }

  return JSON.stringify({ ...body, restrictions });
}

function getAuthorizationHeader() {
  return {
    Authorization: `Bearer ${dynamicValues.FACEIT_WEBHOOK_API_KEY}`,
  };
}

async function fetchWebhookData() {
  return await fetch(url, {
    headers: getAuthorizationHeader(),
  });
}

async function limitRestrictions(limit) {
  const webhookData = await getWebhookDataPayload();
  const { restrictions } = webhookData || {};

  if (!restrictions) return;

  if (restrictions.length > limit) {
    const rest = restrictions.length - limit;
    const playersIDs = restrictions.map(({ value }) => value);
    const playersIDsToRemove = playersIDs.slice(-rest);
    await changeWebhookPlayersList('remove')(playersIDsToRemove);
    await syncWebhookStaticListWithDB();
  }
}

async function getRestrictionsCount() {
  const webhookData = await getWebhookDataPayload();
  const { restrictions } = webhookData || {};
  return restrictions?.length || 0;
}

function manualBearerTokenUpdate(token) {
  setEnvValue('FACEIT_WEBHOOK_API_KEY', token);
  dynamicValues.FACEIT_WEBHOOK_API_KEY = token;
}

export const webhookMgr = {
  getWebhookDataPayload,
  limitRestrictions,
  getRestrictionsCount,
  addPlayersToList: (playersIDs) => changeWebhookPlayersList('add')(playersIDs),
  removePlayersFromList: (playersIDs) => changeWebhookPlayersList('remove')(playersIDs),
  manualBearerTokenUpdate,
};
