import mongoose from 'mongoose';

import {
  MONGO_DB_NAME,
  MONGO_DB_PASSWORD,
  MONGO_DB_CLUSTER_NAME,
} from '#config';

export default async function connectDB() {
  const uri = `mongodb+srv://${MONGO_DB_NAME}:${MONGO_DB_PASSWORD}@cluster0.cqna7jk.mongodb.net/${MONGO_DB_CLUSTER_NAME}?w=majority`;

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
      .catch((e) => console.log(e));
  }

  mongoose.connection.on('error', (e) => {
    console.log(e);
  });
}
