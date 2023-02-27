import express from 'express';

import { TELEGRAM_BOT_API_TOKEN, bots } from '#config';

const router = express.Router();

router.post(`/telegram-webhook-${TELEGRAM_BOT_API_TOKEN}`, async (req, res) => {
  const update = req.body;

  bots.telegram.processUpdate(update);

  res.sendStatus(200);
});

export default router;
