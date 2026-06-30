import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Bot, IBot } from '../models/Bot.js';
import { User } from '../models/User.js';
import { Vote } from '../models/Vote.js';
import { ApiKey } from '../models/ApiKey.js';
import { WebhookLog } from '../models/WebhookLog.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

// Helper to check if a user is the owner or co-owner of a bot
const canEditBot = (userId: string, bot: IBot, userRole: string): boolean => {
  if (userRole === 'admin' || userRole === 'moderator') return true;
  return bot.owner === userId || bot.team.includes(userId);
};

export const submitBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { botId, prefix, shortDesc, longDesc, library, language, categories, tags, inviteUrl, supportUrl, websiteUrl, githubUrl, docsUrl } = req.body;

    const existingBot = await Bot.findOne({ botId });
    if (existingBot) {
      res.status(400).json({ success: false, message: 'A bot with this ID is already listed.' });
      return;
    }

    // Dynamic resolution of bot name and avatar from Discord API
    let botName = `Bot-${botId.substring(0, 4)}`;
    let botAvatarUrl = '';

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (botToken && !botToken.startsWith('discord-bot-token')) {
      try {
        const discordRes = await fetch(`https://discord.com/api/v10/users/${botId}`, {
          headers: {
            Authorization: `Bot ${botToken}`
          }
        });
        if (discordRes.ok) {
          const data = await discordRes.json() as any;
          botName = data.username;
          if (data.avatar) {
            botAvatarUrl = `https://cdn.discordapp.com/avatars/${botId}/${data.avatar}.png`;
          } else {
            // Default avatar fallback
            const defaultAvatarNum = Number(BigInt(botId) >> 22n) % 6;
            botAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
          }
        } else {
          res.status(400).json({ 
            success: false, 
            message: 'Failed to fetch bot details from Discord. Make sure the Bot Client ID is valid and the bot is added to your developer portal.' 
          });
          return;
        }
      } catch (fetchErr) {
        logger.error(`Error querying Discord API for bot ${botId}: ${fetchErr}`);
      }
    } else {
      logger.warn('DISCORD_BOT_TOKEN is not configured. Falling back to default mock naming.');
    }

    // Default invite URL if not provided
    const finalInviteUrl = inviteUrl || `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=0&scope=bot%20applications.commands`;

    const newBot = new Bot({
      botId,
      name: botName,
      avatar: botAvatarUrl,
      prefix,
      shortDesc,
      longDesc,
      library: library || undefined,
      language: language || undefined,
      categories,
      tags,
      inviteUrl: finalInviteUrl,
      supportUrl,
      websiteUrl,
      githubUrl,
      docsUrl,
      owner: userId,
      status: 'pending'
    });

    await newBot.save();
    logger.info(`Bot submitted successfully: ${botName} (${botId}) by ${userId}`);
    res.status(201).json({ success: true, message: 'Bot submitted successfully and is pending review.', bot: newBot });
  } catch (error) {
    logger.error(`Error submitting bot: ${error}`);
    next(error);
  }
};

export const editBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const userRole = req.user?.role || 'user';
    const { id } = req.params; // botId or slug

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bot = await Bot.findOne({ $or: [{ botId: id }, { customSlug: id }] });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    if (!canEditBot(userId, bot, userRole)) {
      res.status(403).json({ success: false, message: 'You do not have permission to edit this bot.' });
      return;
    }

    const updateFields = { ...req.body };
    delete updateFields.botId; // botId is immutable
    delete updateFields.name; // resolved via Discord API
    delete updateFields.avatar; // resolved via Discord API
    delete updateFields.owner; // owner transfers should be separate
    delete updateFields.votes;
    delete updateFields.monthlyVotes;
    delete updateFields.views;
    delete updateFields.uniqueClicks;
    delete updateFields.status; // status can only be updated by admins

    // Verify slug uniqueness if updated
    if (updateFields.customSlug) {
      const slugExists = await Bot.findOne({ customSlug: updateFields.customSlug, botId: { $ne: bot.botId } });
      if (slugExists) {
        res.status(400).json({ success: false, message: 'This custom slug is already taken.' });
        return;
      }
    }

    const updatedBot = await Bot.findOneAndUpdate(
      { botId: bot.botId },
      { $set: updateFields },
      { new: true }
    );

    logger.info(`Bot ${bot.botId} updated by user ${userId}`);
    res.status(200).json({ success: true, message: 'Bot updated successfully.', bot: updatedBot });
  } catch (error) {
    logger.error(`Error editing bot: ${error}`);
    next(error);
  }
};

export const getBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.discordId;
    const userRole = req.user?.role || 'user';

    const bot = await Bot.findOne({ $or: [{ botId: id }, { customSlug: id }] });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    // Access control: If bot is not approved, only owners/team members or mod/admins can view
    if (bot.status !== 'approved' && (!userId || !canEditBot(userId, bot, userRole))) {
      res.status(403).json({ success: false, message: 'This bot is currently pending review or has been restricted.' });
      return;
    }

    // Increment views (naive view counter for demo, could throttle by IP in prod)
    bot.views += 1;
    await bot.save();

    res.status(200).json({ success: true, bot });
  } catch (error) {
    logger.error(`Error fetching bot: ${error}`);
    next(error);
  }
};

export const searchBots = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, category, tag, library, verified, featured, premium, sort, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filterQuery: any = { status: 'approved' };

    if (query) {
      filterQuery.$text = { $search: query as string };
    }
    if (category) {
      filterQuery.categories = category;
    }
    if (tag) {
      filterQuery.tags = tag;
    }
    if (library) {
      filterQuery.library = library;
    }
    if (verified === 'true') {
      filterQuery.verified = true;
    }
    if (featured === 'true') {
      filterQuery.featured = true;
    }
    if (premium === 'true') {
      filterQuery.premium = true;
    }

    // Sorting
    let sortQuery: any = { votes: -1 }; // default: most votes
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'views') {
      sortQuery = { views: -1 };
    } else if (sort === 'servers') {
      sortQuery = { serverCount: -1 };
    } else if (sort === 'monthly') {
      sortQuery = { monthlyVotes: -1 };
    }

    const total = await Bot.countDocuments(filterQuery);
    const bots = await Bot.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      bots
    });
  } catch (error) {
    logger.error(`Error searching bots: ${error}`);
    next(error);
  }
};

export const deleteBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const userRole = req.user?.role || 'user';
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bot = await Bot.findOne({ botId: id });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    // Only owner or admin can delete bot
    if (bot.owner !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'You do not have permission to delete this bot.' });
      return;
    }

    await Bot.deleteOne({ botId: bot.botId });
    // Also delete keys
    await ApiKey.deleteOne({ botId: bot.botId });

    logger.info(`Bot ${bot.botId} deleted by user ${userId}`);
    res.status(200).json({ success: true, message: 'Bot deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting bot: ${error}`);
    next(error);
  }
};

export const voteBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Login is required to vote.' });
      return;
    }

    const bot = await Bot.findOne({ botId: id });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    if (bot.status !== 'approved') {
      res.status(403).json({ success: false, message: 'Cannot vote for unapproved bots.' });
      return;
    }

    // Check cooldown (12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const existingVote = await Vote.findOne({
      botId: bot.botId,
      userId,
      cooldownExpiry: { $gt: new Date() }
    });

    if (existingVote) {
      const remainingMs = existingVote.cooldownExpiry.getTime() - Date.now();
      const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
      const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

      res.status(429).json({
        success: false,
        message: 'Vote cooldown in effect.',
        cooldownRemaining: {
          ms: remainingMs,
          formatted: `${remainingHours}h ${remainingMins}m`
        }
      });
      return;
    }

    // Record the vote
    const cooldownExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const vote = new Vote({
      botId: bot.botId,
      userId,
      cooldownExpiry
    });
    await vote.save();

    // Increment votes on the Bot
    bot.votes += 1;
    bot.monthlyVotes += 1;
    await bot.save();

    logger.info(`User ${userId} voted for Bot ${bot.botId}`);

    // Trigger Developer Webhook (Simulated/Fired in Background)
    const apiKeyRecord = await ApiKey.findOne({ botId: bot.botId });
    // In production, we'd look up a webhook URL in a separate Settings collection
    // For simplicity, we can check a feature flag or config
    // We will simulate webhook firing:
    const mockWebhookUrl = 'https://httpbin.org/post'; // Stand-in demo URL
    try {
      // Background promise fire-and-forget
      fetch(mockWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'webhook-secret'}`
        },
        body: JSON.stringify({
          userId,
          botId: bot.botId,
          type: 'vote',
          timestamp: new Date().toISOString()
        })
      }).then(async (response) => {
        const log = new WebhookLog({
          botId: bot.botId,
          url: mockWebhookUrl,
          event: 'vote',
          payload: JSON.stringify({ userId, botId: bot.botId }),
          statusCode: response.status,
          success: response.ok
        });
        await log.save();
      }).catch(async (err) => {
        const log = new WebhookLog({
          botId: bot.botId,
          url: mockWebhookUrl,
          event: 'vote',
          payload: JSON.stringify({ userId, botId: bot.botId }),
          errorMessage: err.message,
          success: false
        });
        await log.save();
      });
    } catch (whErr) {
      logger.error(`Failed to fire webhook: ${whErr}`);
    }

    res.status(200).json({
      success: true,
      message: 'Voted successfully!',
      votes: bot.votes,
      cooldownExpiry
    });
  } catch (error) {
    logger.error(`Error voting for bot: ${error}`);
    next(error);
  }
};

export const postStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bot = req.apiKeyBot;
    if (!bot) {
      res.status(401).json({ success: false, message: 'API key bot context missing.' });
      return;
    }

    const { serverCount, shardCount } = req.body;
    bot.serverCount = serverCount;
    if (shardCount !== undefined) {
      bot.shardCount = shardCount;
    }
    await bot.save();

    logger.info(`Updated stats via API key for Bot ${bot.botId}: serverCount=${serverCount}`);
    res.status(200).json({ success: true, message: 'Statistics updated successfully.' });
  } catch (error) {
    logger.error(`Error posting statistics: ${error}`);
    next(error);
  }
};

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const botsCount = await Bot.countDocuments({ status: 'approved' });
    const votesCount = await Vote.countDocuments();
    const usersCount = await User.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalBots: botsCount,
        totalVotes: votesCount,
        totalUsers: usersCount
      }
    });
  } catch (error) {
    logger.error(`Error fetching system stats: ${error}`);
    next(error);
  }
};

export const syncBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const { botId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    // Check developer rights (owner or team list)
    if (bot.owner !== userId && !bot.team.includes(userId)) {
      res.status(403).json({ success: false, message: 'Only the bot developer can sync this bot.' });
      return;
    }

    // Cooldown check (4 hours)
    const COOLDOWN_MS = 4 * 60 * 60 * 1000;
    const now = new Date();
    if (bot.lastSyncAt) {
      const diff = now.getTime() - new Date(bot.lastSyncAt).getTime();
      if (diff < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - diff;
        const hrs = Math.floor(remainingMs / (3600 * 1000));
        const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
        res.status(429).json({
          success: false,
          message: `You can only sync bot info once every 4 hours. Please try again in ${hrs}h ${mins}m.`,
          cooldownRemaining: { hours: hrs, minutes: mins }
        });
        return;
      }
    }

    // Fetch details from Discord API
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken || botToken.startsWith('discord-bot-token')) {
      res.status(500).json({ success: false, message: 'Discord bot token is not configured on the backend.' });
      return;
    }

    const discordRes = await fetch(`https://discord.com/api/v10/users/${bot.botId}`, {
      headers: {
        Authorization: `Bot ${botToken}`
      }
    });

    if (discordRes.ok) {
      const data = await discordRes.json() as any;
      bot.name = data.username;
      if (data.avatar) {
        bot.avatar = `https://cdn.discordapp.com/avatars/${bot.botId}/${data.avatar}.png`;
      } else {
        const defaultAvatarNum = Number(BigInt(bot.botId) >> 22n) % 6;
        bot.avatar = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
      }
      bot.lastSyncAt = now;
      await bot.save();
      
      logger.info(`Bot details synced from Discord API: ${bot.name} (${bot.botId})`);
      res.status(200).json({ success: true, message: 'Bot details successfully synced with Discord.', bot });
    } else {
      res.status(400).json({ success: false, message: 'Failed to fetch bot details from Discord. Make sure the Client ID is correct.' });
    }
  } catch (error) {
    logger.error(`Error syncing bot details: ${error}`);
    next(error);
  }
};
