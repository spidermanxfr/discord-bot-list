import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { Bot } from './models/Bot.js';
import { User } from './models/User.js';

// Load environment variables
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

  const botId = '845153824742440991';
  let avatarUrl = '';
  let botName = 'Muzox';

  // 1. Try to fetch bot details from Discord API using Bot token
  const token = process.env.DISCORD_BOT_TOKEN;
  if (token) {
    try {
      console.log('Fetching bot avatar and details from Discord API...');
      const response = await fetch(`https://discord.com/api/v10/users/${botId}`, {
        headers: {
          Authorization: `Bot ${token}`
        }
      });
      if (response.ok) {
        const data: any = await response.json();
        botName = data.username || botName;
        if (data.avatar) {
          avatarUrl = `https://cdn.discordapp.com/avatars/${botId}/${data.avatar}.png`;
          console.log(`Successfully fetched avatar: ${avatarUrl}`);
        } else {
          console.log('Bot has no Discord avatar, using default.');
        }
      } else {
        console.warn(`Discord API returned status ${response.status}. Using default info.`);
      }
    } catch (err: any) {
      console.warn('Failed to fetch bot details from Discord:', err.message || err);
    }
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');

    // 2. Resolve owner "unclaimed"
    let ownerUser = await User.findOne({ discordId: 'unclaimed' });
    if (!ownerUser) {
      console.log('User "unclaimed" not found in DB. Creating unclaimed user...');
      ownerUser = await User.create({
        discordId: 'unclaimed',
        username: 'No author provided',
        globalName: 'Added by admins. For claiming raise ticket',
        role: 'user',
        isBanned: false,
        guilds: [],
        premiumType: 0
      });
      console.log(`Created unclaimed user: ${ownerUser.username} (ID: ${ownerUser.discordId})`);
    } else {
      console.log(`Found existing unclaimed user: ${ownerUser.username} (ID: ${ownerUser.discordId})`);
    }

    // 3. Prepare bot data
    const botData = {
      botId,
      name: botName,
      avatar: avatarUrl,
      shortDesc: "Elevate your music experience with a powerful Discord music bot supporting YouTube, Spotify, SoundCloud and more.",
      longDesc: "Muzox is a feature-rich Discord music bot designed for high-quality audio playback with support for YouTube, Spotify, SoundCloud and multiple music sources. It offers autoplay, queue management, advanced audio filters, button controls, premium features and low-latency playback for Discord servers.",
      prefix: "> or /",
      library: "discord.js",
      language: "JavaScript",
      categories: ["Music"],
      tags: [
        "music",
        "audio",
        "spotify",
        "youtube",
        "soundcloud",
        "filters",
        "24/7",
        "autoplay",
        "queue",
        "premium"
      ],
      inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}`,
      supportUrl: "",
      websiteUrl: "https://muzoxbot.xyz/",
      githubUrl: "",
      docsUrl: "",
      owner: ownerUser.discordId,
      team: [],
      status: "approved",
      rejectionReason: "",
      verified: true,
      featured: false,
      premium: false,
      serverCount: 175000,
      shardCount: 0,
      votes: 0,
      monthlyVotes: 0,
      views: 0,
      uniqueClicks: 0,
      customSlug: "muzox"
    };

    // 4. Insert or Update Bot
    console.log(`Upserting bot "${botName}" (ID: ${botId})...`);
    const bot = await Bot.findOneAndUpdate(
      { botId },
      { $set: botData },
      { new: true, upsert: true }
    );

    console.log(`SUCCESS: Bot "${bot.name}" is now stored and approved in the database!`);
    console.log('Bot details:', {
      id: bot._id,
      botId: bot.botId,
      name: bot.name,
      owner: bot.owner,
      status: bot.status,
      verified: bot.verified,
      premium: bot.premium,
      avatar: bot.avatar
    });

  } catch (error: any) {
    console.error('Database operations failed:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
