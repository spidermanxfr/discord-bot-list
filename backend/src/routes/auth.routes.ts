import { Router } from 'express';
import passport from 'passport';
import { handleDiscordCallback, getMe, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Discord OAuth initiation
router.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback
router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login-failed' }),
  handleDiscordCallback
);

// Get current logged-in user profile
router.get('/me', getMe);

// Logout
router.post('/logout', logout);

export default router;
