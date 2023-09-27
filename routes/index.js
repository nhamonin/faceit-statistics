import main from './main.js';
import faceitWebhook from './faceitWebhook.js';
import telegramWebhook from './telegramWebhook.js';
import data from './data.js';

export default { ...main, ...faceitWebhook, ...telegramWebhook, ...data };
