import main from './main.js';
import faceitWebhook from './faceitWebhook.js';
import telegramWebhook from './telegramWebhook.js';

export default { ...main, ...faceitWebhook, ...telegramWebhook };
