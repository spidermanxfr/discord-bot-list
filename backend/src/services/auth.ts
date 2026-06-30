import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { logger } from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-signing-key-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { discordId: user.discordId, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );
};

export const verifyToken = (token: string): { discordId: string; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { discordId: string; role: string };
  } catch (error) {
    return null;
  }
};

export const initPassport = (): void => {
  passport.serializeUser((user: any, done) => {
    done(null, user.discordId);
  });

  passport.deserializeUser(async (discordId: string, done) => {
    try {
      const user = await User.findOne({ discordId });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const callbackURL = process.env.DISCORD_REDIRECT_URI;

  // Only configure strategy if Discord API credentials are set and valid
  if (clientID && clientSecret && callbackURL && !clientID.startsWith('12345')) {
    logger.info('Registering Passport Discord OAuth Strategy...');
    passport.use(
      new DiscordStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
          scope: ['identify', 'guilds', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.email || undefined;
            
            let user = await User.findOne({ discordId: profile.id });
            
            const guilds = (profile.guilds || []).map((g: any) => ({
              id: g.id,
              name: g.name,
              icon: g.icon,
              owner: g.owner,
              permissions: g.permissions.toString(),
              features: g.features || []
            }));

            const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];
            const isConfiguredAdmin = adminIds.includes(profile.id);

            if (!user) {
              // First user registered becomes admin for convenience
              const userCount = await User.countDocuments();
              const role = (isConfiguredAdmin || userCount === 0) ? 'admin' : 'user';

              user = new User({
                discordId: profile.id,
                username: profile.username,
                globalName: (profile as any).global_name || profile.username,
                avatar: profile.avatar || undefined,
                banner: (profile as any).banner || undefined,
                email,
                locale: profile.locale,
                guilds,
                premiumType: (profile as any).premium_type || 0,
                role,
              });
              await user.save();
              logger.info(`New user registered via Discord: ${profile.username}`);
            } else {
              user.username = profile.username;
              user.globalName = (profile as any).global_name || profile.username;
              user.avatar = profile.avatar || undefined;
              user.banner = (profile as any).banner || undefined;
              user.email = email || user.email;
              user.guilds = guilds;
              user.premiumType = (profile as any).premium_type || user.premiumType;
              if (isConfiguredAdmin) {
                user.role = 'admin';
              }
              await user.save();
            }

            return done(null, user);
          } catch (error: any) {
            logger.error(`Error in Discord Strategy callback: ${error.message}`);
            return done(error, undefined);
          }
        }
      )
    );
  } else {
    logger.warn('Discord OAuth credentials not set or set to defaults. Falling back to Mock authentication Strategy for local testing.');
  }
};
