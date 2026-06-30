import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.js';
import { User, IUser } from '../models/User.js';
import { ApiKey } from '../models/ApiKey.js';
import { Bot, IBot } from '../models/Bot.js';
import { logger } from '../config/logger.js';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      apiKeyBot?: IBot;
    }
  }
}

export type AuthenticatedRequest = Request;

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Check Passport session (if available)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // 2. Check JWT Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (decoded) {
      try {
        const user = await User.findOne({ discordId: decoded.discordId });
        if (user) {
          if (user.isBanned) {
            res.status(403).json({ success: false, message: 'Your account has been banned.', reason: user.banReason });
            return;
          }
          req.user = user;
          return next();
        }
      } catch (error) {
        logger.error(`Error loading JWT user: ${error}`);
      }
    }
  }

  return next();
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await authenticateUser(req, res, () => {
    if (!req.user && !(req.isAuthenticated && req.isAuthenticated())) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }
    next();
  });
};

export const requireRole = (roles: Array<'user' | 'moderator' | 'admin'>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, () => {
      const user = req.user as IUser;
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
        return;
      }
      next();
    });
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireModerator = requireRole(['moderator', 'admin']);

export const requireApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey || typeof apiKey !== 'string') {
    res.status(401).json({ success: false, message: 'Unauthorized: X-API-Key header is missing.' });
    return;
  }

  try {
    const keyRecord = await ApiKey.findOne({ key: apiKey });
    if (!keyRecord) {
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key.' });
      return;
    }

    const bot = await Bot.findOne({ botId: keyRecord.botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot associated with this API key not found.' });
      return;
    }

    if (bot.status === 'banned') {
      res.status(403).json({ success: false, message: 'Action forbidden: Bot is banned.' });
      return;
    }

    req.apiKeyBot = bot;
    next();
  } catch (error) {
    logger.error(`Error in requireApiKey: ${error}`);
    res.status(500).json({ success: false, message: 'Internal server error validating API Key.' });
  }
};
