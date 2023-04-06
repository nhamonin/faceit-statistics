import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';

import { isProduction, host, port } from '#config';
import routes from '#routes';

function requestHandler(req, res) {
  const { method, url } = req;

  const handler = routes[url];
  if (!handler) return res.end('Not found');
  const handlerMethod = handler[method.toLowerCase()];
  if (!handlerMethod) return res.end('Not found');
  return handlerMethod(req, res);
}

export function startServer() {
  if (isProduction) {
    https
      .createServer(
        {
          key: fs.readFileSync('./certs/private.key'),
          cert: fs.readFileSync('./certs/faceit-helper_pro.crt'),
          ca: [
            fs.readFileSync('./certs/faceit-helper_pro-root.crt'),
            fs.readFileSync('./certs/faceit-helper_pro-bundle.crt'),
          ],
        },
        requestHandler
      )
      .listen(port, host, function () {
        console.log(`Server listens https://${host}:${port}`);
      });
  } else {
    http.createServer(requestHandler).listen(port);
  }
}
