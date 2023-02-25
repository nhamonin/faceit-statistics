import path from 'node:path';

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/index.html'));
});

router.get(
  '/.well-known/pki-validation/62479386646DE7D4241078C70CDC23AD.txt',
  (req, res) => {
    res.sendFile(
      path.join(process.cwd(), '/62479386646DE7D4241078C70CDC23AD.txt')
    );
  }
);

export default router;
