import { Faceit } from 'faceit-node-api';
import mongoose from 'mongoose';

import {
  FACEIT_API_KEY,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
} from './config/config.js';
import {
  initBotListener,
  addPlayerListener,
  deletePlayerListener,
  updateTeamPlayersListener,
  initTeamKDListener,
  initTeamEloListener,
} from './controllers/telegramController.js';

Faceit.setApiKey(FACEIT_API_KEY);

initBotListener();
addPlayerListener();
deletePlayerListener();
updateTeamPlayersListener();
initTeamKDListener();
initTeamEloListener();

const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${MONGO_DB_CLUSTER_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log('Connected to DB'))
  .catch((e) => console.log(e.message));
