import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { User } from './models/User.js';

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
    console.error('No MONGODB_URI found.');
    process.exit(1);
  }
  
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');
    
    // Find the user spidermanxfr and set their role to 'admin'
    const targetUsername = 'spidermanxfr';
    console.log(`Searching for user with username "${targetUsername}"...`);
    
    const user = await User.findOne({ username: targetUsername });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`SUCCESS: User "${user.username}" (Discord ID: ${user.discordId}) is now set to role: "${user.role}"`);
    } else {
      console.warn(`User with username "${targetUsername}" not found. listing all users in db:`);
      const allUsers = await User.find({}, 'username discordId role');
      console.log(allUsers);
    }
  } catch (error: any) {
    console.error('Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  }
};

run();
