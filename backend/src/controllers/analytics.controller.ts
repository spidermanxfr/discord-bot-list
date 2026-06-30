import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Analytics } from '../models/Analytics.js';
import { Bot } from '../models/Bot.js';
import { logger } from '../config/logger.js';

export const getBotAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const { botId } = req.params;
    const { range = '30' } = req.query; // 7, 30, 90 days

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    if (bot.owner !== userId && bot.team.indexOf(userId) === -1 && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied: Analytics restricted to bot developers.' });
      return;
    }

    const daysCount = Math.max(7, Math.min(90, Number(range)));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const history = await Analytics.find({
      botId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      range: daysCount,
      history
    });
  } catch (error) {
    logger.error(`Error loading analytics: ${error}`);
    next(error);
  }
};

export const trackBotClick = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { botId } = req.params;
    const bot = await Bot.findOne({ botId });
    
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.uniqueClicks += 1;
    await bot.save();

    // Increment click count in daily Analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { botId: bot.botId, date: today },
      { $inc: { uniqueClicks: 1 } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Click tracked.' });
  } catch (error) {
    logger.error(`Error tracking click: ${error}`);
    next(error);
  }
};
