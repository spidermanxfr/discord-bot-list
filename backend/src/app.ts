import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables (fallback to root .env if running from backend folder)
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('../.env')) {
  dotenv.config({ path: '../.env' });
} else {
  dotenv.config();
}

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initPassport } from './services/auth.js';

// Route imports
import authRouter from './routes/auth.routes.js';
import botRouter from './routes/bot.routes.js';
import reviewRouter from './routes/review.routes.js';
import userRouter from './routes/user.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import adminRouter from './routes/admin.routes.js';

// Validate environment variables on startup
const validateEnv = (): void => {
  const required = [
    'MONGODB_URI',
    'SESSION_SECRET',
    'JWT_SECRET'
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please configure your .env file. Exiting process.');
    process.exit(1);
  }

  // Check for Discord API credentials
  const dClientId = process.env.DISCORD_CLIENT_ID;
  const dClientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!dClientId || !dClientSecret || dClientId.startsWith('12345') || dClientSecret.includes('secret-here')) {
    logger.warn('--------------------------------------------------------------------------');
    logger.warn('WARNING: Valid Discord OAuth credentials are not fully configured.');
    logger.warn('Authentication will fallback to MOCK mode (POST /api/auth/mock) in dev.');
    logger.warn('--------------------------------------------------------------------------');
  }
};

validateEnv();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Init Passport Configuration
initPassport();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://cdn.discordapp.com", "https://images.discordapp.net"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Sessions stored in MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-session-development',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Trust Proxy for Cloudflare / Nginx
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Global API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // limit each IP to 200 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/bots', botRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/user', userRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Discord Bot List API Service is operational.',
    version: '1.0.0'
  });
});

// Handle 404 Route
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource endpoint not found.' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Express App Error: ${err.message || err}`);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
// Watch reload trigger for index updates
