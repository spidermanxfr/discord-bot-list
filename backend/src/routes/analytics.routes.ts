import { Router } from 'express';
import { getBotAnalytics, trackBotClick } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get specific bot analytics logs (requires developer ownership)
router.get('/:botId', requireAuth, getBotAnalytics);

// Public track click
router.post('/:botId/click', trackBotClick);

export default router;
