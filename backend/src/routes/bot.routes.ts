import { Router } from 'express';
import { submitBot, editBot, getBot, searchBots, deleteBot, voteBot, postStats, getStats, syncBot } from '../controllers/bot.controller.js';
import { requireAuth, requireApiKey } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { BotSubmissionSchema, BotEditSchema, BotStatsSchema } from '../validators/index.js';

const router = Router();

// Public Stats
router.get('/stats', getStats);

// Search Bots
router.get('/search', searchBots);

// Submit Bot
router.post('/', requireAuth, validate(BotSubmissionSchema), submitBot);

// Get Bot Details (Supports botId or custom slug)
router.get('/:id', getBot);

// Edit Bot
router.put('/:id', requireAuth, validate(BotEditSchema), editBot);

// Delete Bot
router.delete('/:id', requireAuth, deleteBot);

// Vote for Bot
router.post('/:id/vote', requireAuth, voteBot);

// Sync bot details with Discord API
router.post('/:botId/sync', requireAuth, syncBot);

// Post statistics (developers' bots post servers/shards count using API Key)
router.post('/post-stats/stats', requireApiKey, validate(BotStatsSchema), postStats);

export default router;
