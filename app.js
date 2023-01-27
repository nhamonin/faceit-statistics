import express from 'express';
import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEYS } from '#config';
import { initTelegramBotListener } from '#controllers';
import { connectDB, adjustConsoleLog } from '#utils';
import { main, webhook } from '#routes';

Faceit.setApiKeys(FACEIT_API_KEYS);
Faceit.prototype.counter = 0;
Faceit.prototype.hour = null;

Object.getOwnPropertyNames(Faceit.prototype).forEach((name) => {
  Faceit.prototype['_' + name] = Faceit.prototype[name];
  Faceit.prototype[name] = function () {
    const result = this['_' + name](...arguments);
    ++Faceit.prototype._counter;
    return result;
  };
});

setInterval(() => {
  const date = new Date();
  const hour = date.getHours();
  if (!Faceit.prototype._hour) {
    Faceit.prototype._hour = hour;
  }
  if (Faceit.prototype._hour && Faceit.prototype._hour !== hour) {
    console.log(Faceit.prototype._counter / 2);
    Faceit.prototype._counter = 0;
    Faceit.prototype._hour = hour;
  }
}, 3000);

await connectDB();
adjustConsoleLog();
initTelegramBotListener();

const app = express();
app.use(express.json());

app.use(main);
app.use(webhook);

app.listen(80, () => {});
