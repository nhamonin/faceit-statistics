import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isProduction, port, host, SERVER_URL, mimeTypes } from '#config';
import routes from '#routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requestHandler(req, res) {
  const { method, url } = req;

  if (url.startsWith('/public/')) {
    const ext = path.extname(url);
    const mimeType = mimeTypes[ext];

    if (mimeType) {
      const filePath = path.join(__dirname, '..', '..', url);

      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end(`Error: ${error.code}\n`);
          res.end();
        } else {
          if (
            mimeType === 'font/ttf' ||
            mimeType === 'font/otf' ||
            mimeType === 'font/woff' ||
            mimeType === 'font/woff2'
          ) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
          }

          res.writeHead(200, { 'Content-Type': mimeType });
          res.end(content, 'utf-8');
        }
      });
    } else {
      res.writeHead(400);
      res.end('Invalid file type');
    }

    return;
  }

  const handler = routes[url];
  if (!handler) return res.end('Not found');
  const handlerMethod = handler[method.toLowerCase()];
  if (!handlerMethod) return res.end('Not found');
  return handlerMethod(req, res);
}

export function startServer() {
  const options = {
    key: fs.readFileSync(
      `./certs/private${isProduction ? '.key' : '_test.pem'}`
    ),
    cert: fs.readFileSync(
      `./certs/${
        isProduction ? 'faceit-helper_pro.crt' : 'certificate_test.pem'
      }`
    ),
    ...(isProduction && {
      ca: [
        fs.readFileSync('./certs/faceit-helper_pro-root.crt'),
        fs.readFileSync('./certs/faceit-helper_pro-bundle.crt'),
      ],
    }),
  };

  https.createServer(options, requestHandler).listen(port, host, () => {
    console.log(`Server listens ${SERVER_URL}`);
  });
}
