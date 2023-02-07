import path from 'path';

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'templates', '/index.html'));
});

export default router;
