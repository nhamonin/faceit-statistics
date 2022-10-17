import mongoose from 'mongoose';

import {
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
} from '../../config/config.js';

export default function connectDB() {
  const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${MONGO_DB_CLUSTER_NAME}?retryWrites=true&w=majority`;

  mongoose
    .connect(uri)
    .then(() => console.log('Connected to DB'))
    .catch((e) => console.log(e.message));
}
