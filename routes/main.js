import path from 'path';

import express from 'express';
import expressStatusMonitor from 'express-status-monitor';

const router = express.Router();

router.use(expressStatusMonitor());
router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'templates', '/index.html'));
});

export default router;
