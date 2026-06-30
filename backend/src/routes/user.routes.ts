import { Router } from 'express';
import { getDashboardData, generateApiKey, deleteApiKey, getApiKey } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get developer dashboard bots
router.get('/dashboard', requireAuth, getDashboardData);

// API Key management routes
router.get('/dashboard/:botId/key', requireAuth, getApiKey);
router.post('/dashboard/:botId/key', requireAuth, generateApiKey);
router.delete('/dashboard/:botId/key', requireAuth, deleteApiKey);

export default router;
