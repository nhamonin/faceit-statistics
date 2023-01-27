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

  const mongooseConnectWrapper = async () => {
    try {
      await mongooseConnect();
    } catch (e) {
      await mongooseConnectWrapper();
      console.log(e);
    }
  };

  await mongooseConnectWrapper();

  async function mongooseConnect() {
    mongoose.set('strictQuery', false);
    await mongoose
      .connect(uri, {
        keepAlive: true,
        useNewUrlParser: true,
        autoIndex: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then(() => console.log('Connected to DB', new Date().toLocaleString()))
      .catch((e) => console.log(e.message));
  }

  mongoose.connection.on('error', (e) => {
    console.log(e);
  });
}
