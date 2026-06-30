import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables (fallback to root .env if running from backend folder)
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('../.env')) {
  dotenv.config({ path: '../.env' });
} else {
  dotenv.config();
}

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in environment variables.');
    process.exit(1);
  }
  
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');
    
    const db = mongoose.connection.db;
    if (db) {
      console.log('Dropping text index from "bots" collection...');
      // Mongoose auto-generates text indexes with the fields joined by '_text'
      const result = await db.collection('bots').dropIndex('name_text_shortDesc_text_longDesc_text');
      console.log('Successfully dropped old text index:', result);
    } else {
      console.error('Database connection object is undefined.');
    }
  } catch (error: any) {
    console.error('Error dropping index:', error.message || error);
    console.log('If the error says index does not exist, that is fine.');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
