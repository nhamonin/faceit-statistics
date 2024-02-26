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
  '/.well-known/pki-validation/62479386646DE7D4241078C70CDC23AD.txt': {
    get: (req, res) => {
      const filePath = path.join(process.cwd(), '/0-62479386646DE7D4241078C70CDC23AD.txt');

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
