import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Bot } from '../models/Bot.js';
import { User } from '../models/User.js';
import { ApiKey } from '../models/ApiKey.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

export const getDashboardData = async (
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

    // Get user's submitted bots
    const myBots = await Bot.find({ $or: [{ owner: userId }, { team: userId }] });

    res.status(200).json({
      success: true,
      bots: myBots
    });
  } catch (error) {
    logger.error(`Error loading dashboard: ${error}`);
    next(error);
  }
};

export const generateApiKey = async (
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

    // Only owners can generate API keys
    if (bot.owner !== userId) {
      res.status(403).json({ success: false, message: 'Only the bot owner can generate API keys.' });
      return;
    }

    // Generate API key: prefix "dbl_" followed by cryptographically random string
    const key = `dbl_${crypto.randomBytes(24).toString('hex')}`;
    
    // Upsert key
    const apiKeyRecord = await ApiKey.findOneAndUpdate(
      { botId },
      { key },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'API Key generated successfully. Keep this safe!',
      apiKey: key
    });
  } catch (error) {
    logger.error(`Error generating API Key: ${error}`);
    next(error);
  }
};

export const deleteApiKey = async (
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

    if (bot.owner !== userId) {
      res.status(403).json({ success: false, message: 'Only the bot owner can delete API keys.' });
      return;
    }

    await ApiKey.deleteOne({ botId });
    res.status(200).json({ success: true, message: 'API Key deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting API Key: ${error}`);
    next(error);
  }
};

export const getApiKey = async (
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

    if (bot.owner !== userId) {
      res.status(403).json({ success: false, message: 'Only the bot owner can read API keys.' });
      return;
    }

    const record = await ApiKey.findOne({ botId });
    res.status(200).json({
      success: true,
      apiKey: record ? record.key : null
    });
  } catch (error) {
    logger.error(`Error getting API Key: ${error}`);
    next(error);
  }
};
