import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Bot } from '../models/Bot.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

export const getPendingQueue = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bots = await Bot.find({ status: 'pending' }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, bots });
  } catch (error) {
    logger.error(`Error loading pending queue: ${error}`);
    next(error);
  }
};

export const approveBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { botId } = req.params;

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.status = 'approved';
    await bot.save();

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'BOT_APPROVE',
      targetId: botId,
      targetType: 'bot',
      details: `Approved bot: ${bot.name}`
    });
    await log.save();

    res.status(200).json({ success: true, message: 'Bot approved successfully.', bot });
  } catch (error) {
    logger.error(`Error approving bot: ${error}`);
    next(error);
  }
};

export const rejectBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { botId } = req.params;
    const { reason } = req.body;

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.status = 'rejected';
    bot.rejectionReason = reason;
    await bot.save();

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'BOT_REJECT',
      targetId: botId,
      targetType: 'bot',
      details: `Rejected bot: ${bot.name}. Reason: ${reason}`
    });
    await log.save();

    res.status(200).json({ success: true, message: 'Bot rejected successfully.', bot });
  } catch (error) {
    logger.error(`Error rejecting bot: ${error}`);
    next(error);
  }
};

export const banBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { botId } = req.params;
    const { reason } = req.body;

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.status = 'banned';
    bot.rejectionReason = reason;
    await bot.save();

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'BOT_BAN',
      targetId: botId,
      targetType: 'bot',
      details: `Banned bot: ${bot.name}. Reason: ${reason}`
    });
    await log.save();

    res.status(200).json({ success: true, message: 'Bot banned successfully.', bot });
  } catch (error) {
    logger.error(`Error banning bot: ${error}`);
    next(error);
  }
};

export const toggleVerifyBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { botId } = req.params;

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.verified = !bot.verified;
    await bot.save();

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'BOT_VERIFY_TOGGLE',
      targetId: botId,
      targetType: 'bot',
      details: `${bot.verified ? 'Verified' : 'Unverified'} bot: ${bot.name}`
    });
    await log.save();

    res.status(200).json({ success: true, message: `Bot verification set to ${bot.verified}`, bot });
  } catch (error) {
    logger.error(`Error toggling verify for bot: ${error}`);
    next(error);
  }
};

export const toggleFeatureBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { botId } = req.params;

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    bot.featured = !bot.featured;
    await bot.save();

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'BOT_FEATURE_TOGGLE',
      targetId: botId,
      targetType: 'bot',
      details: `${bot.featured ? 'Featured' : 'Unfeatured'} bot: ${bot.name}`
    });
    await log.save();

    res.status(200).json({ success: true, message: `Bot featured set to ${bot.featured}`, bot });
  } catch (error) {
    logger.error(`Error toggling featured for bot: ${error}`);
    next(error);
  }
};

export const banUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ discordId: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isBanned = true;
    user.banReason = reason;
    await user.save();

    // Ban all bots owned by this user
    await Bot.updateMany({ owner: userId }, { $set: { status: 'banned', rejectionReason: `Owner banned: ${reason}` } });

    // Log action
    const log = new AuditLog({
      userId: adminId,
      action: 'USER_BAN',
      targetId: userId,
      targetType: 'user',
      details: `Banned user ${user.username}. Reason: ${reason}`
    });
    await log.save();

    res.status(200).json({ success: true, message: 'User banned and all owned bots disabled successfully.' });
  } catch (error) {
    logger.error(`Error banning user: ${error}`);
    next(error);
  }
};

export const getReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error(`Error listing reports: ${error}`);
    next(error);
  }
};

export const resolveReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.discordId || 'system';
    const { reportId } = req.params;
    const { status, notes } = req.body; // 'resolved' or 'dismissed'

    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    report.status = status;
    report.resolvedBy = adminId;
    report.resolutionNotes = notes;
    await report.save();

    res.status(200).json({ success: true, message: `Report set to ${status}.`, report });
  } catch (error) {
    logger.error(`Error resolving report: ${error}`);
    next(error);
  }
};

export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    logger.error(`Error fetching audit logs: ${error}`);
    next(error);
  }
};

export const getAllBots = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bots = await Bot.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, bots });
  } catch (error) {
    logger.error(`Error loading all bots: ${error}`);
    next(error);
  }
};

