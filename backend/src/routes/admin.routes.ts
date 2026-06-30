import { Router } from 'express';
import {
  getPendingQueue,
  approveBot,
  rejectBot,
  banBot,
  toggleVerifyBot,
  toggleFeatureBot,
  banUser,
  getReports,
  resolveReport,
  getAuditLogs,
  getAllBots
} from '../controllers/admin.controller.js';
import { requireModerator, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Pending Queue
router.get('/queue', requireModerator, getPendingQueue);

// Bot Actions
router.post('/bot/:botId/approve', requireModerator, approveBot);
router.post('/bot/:botId/reject', requireModerator, rejectBot);
router.post('/bot/:botId/ban', requireModerator, banBot);
router.post('/bot/:botId/verify', requireModerator, toggleVerifyBot);
router.post('/bot/:botId/feature', requireModerator, toggleFeatureBot);
router.get('/bots', requireModerator, getAllBots);

// User Suspension
router.post('/user/:userId/ban', requireModerator, banUser);

// Tickets/Reports Queue
router.get('/reports', requireModerator, getReports);
router.post('/reports/:reportId/resolve', requireModerator, resolveReport);

// Audit System Logs
router.get('/audit-logs', requireAdmin, getAuditLogs);

export default router;
