import mongoose from 'mongoose';

import {
  ENVIRONMENT,
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
  MONGO_DB_CLUSTER_NAME_TEST,
} from '#config';

export default async function connectDB() {
  const mongoCluster =
    ENVIRONMENT === 'PRODUCTION'
      ? MONGO_DB_CLUSTER_NAME
      : MONGO_DB_CLUSTER_NAME_TEST;
  const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${mongoCluster}?w=majority`;

  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxIdleTimeMS: 30000,
      maxConnecting: 10,
      retryWrites: true,
      socketTimeoutMS: 45000,
      keepAlive: true,
      reconnectTries: 10,
    })
    .then(() => console.log('Connected to DB', new Date().toLocaleString()))
    .catch((e) => console.log(e.message));
}
