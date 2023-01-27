import express from 'express';
import { Faceit } from 'faceit-node-api';

import { FACEIT_API_KEYS } from '#config';
import { initTelegramBotListener } from '#controllers';
import { connectDB, adjustConsoleLog } from '#utils';
import { main, webhook } from '#routes';

Faceit.setApiKeys(FACEIT_API_KEYS);

await connectDB();
adjustConsoleLog();
initTelegramBotListener();

const app = express();
app.use(express.json());

app.use(main);
app.use(webhook);

app.listen(80, () => {});
