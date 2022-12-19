import mongoose from 'mongoose';

import {
  ENVIRONMENT,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  MONGO_DB_CLUSTER_NAME_TEST,
} from '#config';

export default function connectDB() {
  const mongoCluster =
    ENVIRONMENT === 'PRODUCTION'
      ? MONGO_DB_CLUSTER_NAME
      : MONGO_DB_CLUSTER_NAME_TEST;
  const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${mongoCluster}?retryWrites=true&w=majority`;

  mongoose
    .connect(uri)
    .then(() => console.log('Connected to DB', new Date().toLocaleString()))
    .catch((e) => console.log(e.message));
}
