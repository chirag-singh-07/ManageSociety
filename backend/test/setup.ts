import mongoose from 'mongoose';

// Default: use a real MongoDB (docker/local). In some Windows setups, spawning mongod for
// mongodb-memory-server is blocked (EPERM).
let mongod: any | null = null;

beforeAll(async () => {
  const fallbackUri =
    process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/managesociety_test';

  if (process.env.MONGODB_MEMORY_SERVER === '1') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    return;
  }

  mongod = null;
  try {
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
  } catch (err: any) {
    throw new Error(
      `Cannot connect to MongoDB for tests at ${fallbackUri}. Start MongoDB locally (or set MONGODB_URI_TEST).\nOriginal error: ${String(
        err?.message ?? err,
      )}`,
    );
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});
