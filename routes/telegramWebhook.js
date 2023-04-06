import { receiveArgs } from '#utils';
import { TELEGRAM_BOT_API_TOKEN, bots } from '#config';

export default {
  [`/telegram-webhook-${TELEGRAM_BOT_API_TOKEN}`]: {
    post: (req, res) => {
      const body = receiveArgs(req);
      bots.telegram.processUpdate(body);

      res.statusCode = 200;
      res.end('OK');
    },
  },
};
