import path from 'node:path';
import fs from 'node:fs';

export default {
  '/': {
    get: (req, res) => {
      const filePath = path.join(process.cwd(), '/index.html');

      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    },
  },
};
