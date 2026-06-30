import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { Bot } from './models/Bot.js';

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
  
  await mongoose.connect(uri);
  const botId = '1334870915556839487';
  const bot = await Bot.findOne({ botId });
  if (bot) {
    console.log('BOT INSPECTION DETAILS:');
    console.log('botId:', bot.botId);
    console.log('name:', bot.name);
    console.log('owner:', bot.owner);
    console.log('team:', bot.team);
  } else {
    console.log(`Bot with ID ${botId} not found in database.`);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run();
