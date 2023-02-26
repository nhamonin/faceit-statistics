import express from 'express';

import { TELEGRAM_BOT_API_TOKEN } from '#config';

const router = express.Router();

router.post(`/telegram-webhook-${TELEGRAM_BOT_API_TOKEN}`, async (req, res) => {
  console.log(req.body);

  res.sendStatus(200);
});

export default router;
