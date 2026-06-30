import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User, IUser } from '../models/User.js';
import { generateToken } from '../services/auth.js';
import { logger } from '../config/logger.js';

export const handleDiscordCallback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login-failed`);
      return;
    }
    
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Redirect user back to NextJS app with token in query param
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error(`Error in auth callback: ${error}`);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login-failed`);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  // If user is set by authenticateUser middleware
  const user = req.user || (req.isAuthenticated && req.isAuthenticated() ? (req.user as IUser) : null);
  
  if (!user) {
    res.status(401).json({ success: false, message: 'Not logged in.' });
    return;
  }
  
  res.status(200).json({
    success: true,
    user: {
      discordId: user.discordId,
      username: user.username,
      globalName: user.globalName,
      avatar: user.avatar,
      banner: user.banner,
      email: user.email,
      role: user.role,
      premiumType: user.premiumType,
      guilds: user.guilds
    }
  });
};

export const logout = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.logout) {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
  } else {
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
};

// MOCK LOGIN FOR DEVELOPMENT / OFFLINE TESTING
export const handleMockLogin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ success: false, message: 'Mock login only allowed in development mode.' });
    return;
  }

  const requestedRole = (req.query.role as string) || 'user';
  let mockId = '100000000000000001';
  let mockUsername = 'MockUser';
  let mockRole: 'user' | 'moderator' | 'admin' = 'user';

  if (requestedRole === 'admin') {
    mockId = '100000000000000003';
    mockUsername = 'MockAdmin';
    mockRole = 'admin';
  } else if (requestedRole === 'moderator') {
    mockId = '100000000000000002';
    mockUsername = 'MockModerator';
    mockRole = 'moderator';
  }

  try {
    let user = await User.findOne({ discordId: mockId });
    if (!user) {
      user = new User({
        discordId: mockId,
        username: mockUsername,
        globalName: `${mockUsername}#9999`,
        avatar: undefined,
        role: mockRole,
        premiumType: mockRole === 'admin' ? 2 : 0,
        guilds: [
          {
            id: '888888888888888888',
            name: 'Mock Developers Server',
            icon: null,
            owner: true,
            permissions: '2147483647'
          }
        ]
      });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: `Authenticated as ${mockUsername} (${mockRole})`,
      token,
      user: {
        discordId: user.discordId,
        username: user.username,
        globalName: user.globalName,
        role: user.role,
        premiumType: user.premiumType
      }
    });
  } catch (error) {
    logger.error(`Error in mock login: ${error}`);
    res.status(500).json({ success: false, message: 'Failed to create mock session.' });
  }
};
