import { Faceit } from 'faceit-node-api';
import mongoose from 'mongoose';

import {
  initBot,
  addPlayerListener,
  deletePlayerListener,
  initTeamStatsListener,
  initTeamEloListener,
} from './controllers/telegramController.mjs';

const {
  FACEIT_API_KEY,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
} = process.env;

Faceit.setApiKey(FACEIT_API_KEY);

initBot();
addPlayerListener();
deletePlayerListener();
initTeamStatsListener();
initTeamEloListener();

const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${MONGO_DB_CLUSTER_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log('Connected to DB'))
  .catch((e) => console.log(e.message));
