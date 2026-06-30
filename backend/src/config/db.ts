import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discord_bot_list';
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    logger.info('Successfully connected to MongoDB database.');

    // Check and drop deprecated userId_1 index if it exists on the users collection
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
          const usersCollection = db.collection('users');
          const indexes = await usersCollection.indexes();
          if (indexes.some(idx => idx.name === 'userId_1')) {
            await usersCollection.dropIndex('userId_1');
            logger.info('Successfully dropped deprecated unique index userId_1 on users collection.');
          }
        }
      }
    } catch (indexError) {
      logger.warn(`Failed to drop deprecated index: ${indexError}`);
    }
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};
